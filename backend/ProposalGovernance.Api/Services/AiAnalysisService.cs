using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using ProposalGovernance.Api.Models;

namespace ProposalGovernance.Api.Services
{
    public class AiAnalysisResult
    {
        public int FeasibilityScore { get; set; }
        public int StrategicScore { get; set; }
        public int RiskScore { get; set; } // 1-10, 10 is lowest risk, 1 is highest risk
        public int RoiScore { get; set; }
        public decimal SuggestedBudget { get; set; }
        public string Summary { get; set; } = string.Empty;
        public string RiskAssessment { get; set; } = string.Empty;
        public string RoiAnalysis { get; set; } = string.Empty;
        public string Recommendation { get; set; } = string.Empty; // "Approve", "Conditional Approve", "Reject"
        public string Suggestion { get; set; } = string.Empty;
        public string Confidence { get; set; } = string.Empty;
        public string Domain { get; set; } = string.Empty;
        public string AnalysisTimestamp { get; set; } = string.Empty;
    }

    public interface IAiAnalysisService
    {
        Task<AiAnalysisResult> AnalyzeProposalAsync(Proposal proposal);
    }

    public class AiAnalysisService : IAiAnalysisService
    {
        private readonly HttpClient _httpClient;
        private readonly string _geminiApiKey;
        private const string GeminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

        public AiAnalysisService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _geminiApiKey = configuration["Gemini:ApiKey"] ?? string.Empty;
        }

        public async Task<AiAnalysisResult> AnalyzeProposalAsync(Proposal proposal)
        {
            // Try Gemini first
            if (!string.IsNullOrWhiteSpace(_geminiApiKey))
            {
                try
                {
                    return await CallGeminiAsync(proposal);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[AiAnalysisService] Gemini API failed: {ex.Message}. Falling back to heuristic engine.");
                }
            }

            // Fallback: deterministic heuristic engine
            return HeuristicAnalyze(proposal);
        }

        // ──────────────────────────────────────────────────────────────────────
        // GEMINI API CALL
        // ──────────────────────────────────────────────────────────────────────
        private async Task<AiAnalysisResult> CallGeminiAsync(Proposal proposal)
        {
            var prompt = $@"
You are an expert corporate governance AI that evaluates business capital proposals.

Analyze the following startup business proposal and return ONLY a valid JSON object with no additional text, markdown, or formatting. No explanation. No code fences. Just the raw JSON.

PROPOSAL DETAILS:
Startup Name: {proposal.StartupName}
Proposal Title: {proposal.Title}
Brief Description: {proposal.Description}
Problem Statement: {proposal.ProblemStatement}
Proposed Solution: {proposal.ProposedStatement}
Requested Budget: ${proposal.RequestedAmount:N0}
Equity Offered: {proposal.EquityOffered:N2}%
Business Model: {proposal.BusinessModel ?? "Not provided"}
Team Details: {proposal.TeamDetails}
Demo Video Link: {proposal.DemoVideoUrl ?? "Not provided"}

Return this exact JSON structure:
{{
  ""feasibilityScore"": <integer 1-10, how technically feasible is this project>,
  ""strategicScore"": <integer 1-10, how strategically aligned is it with typical business goals>,
  ""riskScore"": <integer 1-10, where 10 means minimal risk and 1 means very high risk>,
  ""roiScore"": <integer 1-10, expected return on investment potential>,
  ""suggestedBudget"": <decimal number, recommended funding amount based on risk and merit>,
  ""summary"": <2-3 sentence executive summary of the proposal analysis>,
  ""riskAssessment"": <2-3 sentence risk factor analysis, use emoji prefix like ⚠️ or ✅ or 🔶 based on risk level>,
  ""roiAnalysis"": <2-3 sentence ROI and financial yield analysis, use emoji prefix like 💰 or 📊 or 📉>,
  ""recommendation"": <exactly one of: ""Approve"", ""Conditional Approve"", or ""Reject"">,
  ""suggestion"": <1-2 sentence actionable suggestion for improving the proposal or implementation>,
  ""confidence"": <confidence percentage like ""87%"">,
  ""domain"": <domain category like ""Technology / AI"", ""Marketing & Growth"", ""Governance & Compliance"", etc.>
}}
";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.4,
                    maxOutputTokens = 1024,
                    responseMimeType = "application/json"
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(
                $"{GeminiEndpoint}?key={_geminiApiKey}",
                content);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[AiAnalysisService] Gemini API failed with status {response.StatusCode}: {errorBody}");
            }

            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseBody);

            // Extract the text content from Gemini's response envelope
            var textContent = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? "{}";

            // Parse the AI-generated JSON result
            using var resultDoc = JsonDocument.Parse(textContent);
            var root = resultDoc.RootElement;

            int feas   = GetInt(root,    "feasibilityScore",  6);
            int strat  = GetInt(root,    "strategicScore",    6);
            int risk   = GetInt(root,    "riskScore",         5);
            int roi    = GetInt(root,    "roiScore",          6);
            decimal suggestedBudget = GetDecimal(root, "suggestedBudget", proposal.RequestedAmount);

            return new AiAnalysisResult
            {
                FeasibilityScore  = Math.Clamp(feas,  1, 10),
                StrategicScore    = Math.Clamp(strat, 1, 10),
                RiskScore         = Math.Clamp(risk,  1, 10),
                RoiScore          = Math.Clamp(roi,   1, 10),
                SuggestedBudget   = Math.Round(suggestedBudget, 2),
                Summary           = GetString(root, "summary",          "No summary provided."),
                RiskAssessment    = GetString(root, "riskAssessment",   "No risk assessment available."),
                RoiAnalysis       = GetString(root, "roiAnalysis",      "No ROI analysis available."),
                Recommendation    = GetString(root, "recommendation",   "Conditional Approve"),
                Suggestion        = GetString(root, "suggestion",       "Review and refine the proposal scope."),
                Confidence        = GetString(root, "confidence",       "75%"),
                Domain            = GetString(root, "domain",           "General Operations"),
                AnalysisTimestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC")
            };
        }

        // ──────────────────────────────────────────────────────────────────────
        // JSON HELPER METHODS
        // ──────────────────────────────────────────────────────────────────────
        private static int GetInt(JsonElement root, string key, int fallback)
        {
            if (root.TryGetProperty(key, out var prop) && prop.TryGetInt32(out int val)) return val;
            return fallback;
        }

        private static decimal GetDecimal(JsonElement root, string key, decimal fallback)
        {
            if (root.TryGetProperty(key, out var prop) && prop.TryGetDecimal(out decimal val)) return val;
            return fallback;
        }

        private static string GetString(JsonElement root, string key, string fallback)
        {
            if (root.TryGetProperty(key, out var prop)) return prop.GetString() ?? fallback;
            return fallback;
        }

        // ──────────────────────────────────────────────────────────────────────
        // FALLBACK HEURISTIC ENGINE (used when Gemini API is unavailable)
        // ──────────────────────────────────────────────────────────────────────

        private static bool HasKeyword(string contentLower, string[] keywords)
        {
            foreach (var kw in keywords)
            {
                if (Regex.IsMatch(contentLower, $@"\b{Regex.Escape(kw)}\b")) return true;
            }
            return false;
        }

        private static string DetectDomain(string contentLower)
        {
            if (HasKeyword(contentLower, new[] { "ai", "machine learning", "intelligence", "gpu", "neural", "llm" }))
                return "Technology / Artificial Intelligence";
            if (HasKeyword(contentLower, new[] { "cloud", "server", "infrastructure", "migration", "devops" }))
                return "Technology / Infrastructure";
            if (HasKeyword(contentLower, new[] { "marketing", "brand", "campaign", "advertising" }))
                return "Marketing & Growth";
            if (HasKeyword(contentLower, new[] { "security", "compliance", "audit", "gdpr", "iso" }))
                return "Governance & Compliance";
            if (HasKeyword(contentLower, new[] { "hr", "talent", "training", "workforce", "learning" }))
                return "Human Capital";
            if (HasKeyword(contentLower, new[] { "data", "analytics", "dashboard", "bi", "reporting" }))
                return "Data & Analytics";
            if (HasKeyword(contentLower, new[] { "product", "launch", "feature", "roadmap" }))
                return "Product Development";
            return "General Operations";
        }

        private static AiAnalysisResult HeuristicAnalyze(Proposal proposal)
        {
            string contentLower = (proposal.Title + " " + proposal.Description + " " + proposal.ProblemStatement + " " + proposal.ProposedStatement + " " + proposal.TeamDetails).ToLower();
            string domain = DetectDomain(contentLower);

            // 1. Feasibility Score (Based on detail provided)
            int feasibility = 5; 
            if (!string.IsNullOrWhiteSpace(proposal.TeamDetails) && proposal.TeamDetails.Length > 50) feasibility += 2;
            if (!string.IsNullOrWhiteSpace(proposal.ProposedStatement) && proposal.ProposedStatement.Length > 100) feasibility += 2;
            if (!string.IsNullOrWhiteSpace(proposal.DemoVideoUrl)) feasibility += 1;

            // 2. Strategic Score (Based on domain and thoroughness)
            int strategic = 5;
            if (domain.Contains("Technology") || domain.Contains("Data")) strategic += 2;
            if (domain.Contains("Governance") || domain.Contains("Compliance")) strategic += 1;
            if (contentLower.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length > 200) strategic += 1;

            // 3. Risk Score (Based on Requested Amount and overall detail)
            // Higher score = Lower Risk
            int risk = 6;
            if (proposal.RequestedAmount > 1_000_000) risk -= 2;
            else if (proposal.RequestedAmount < 100_000) risk += 2;
            
            if (string.IsNullOrWhiteSpace(proposal.BusinessModel) || proposal.BusinessModel.Length < 20) risk -= 2; // Lack of business model increases risk

            // 4. ROI Score (Based on Equity Offered and Amount)
            int roi = 5;
            if (proposal.EquityOffered >= 15) roi += 2;
            else if (proposal.EquityOffered >= 5) roi += 1;
            else roi -= 2;

            if (domain == "Technology / Artificial Intelligence") roi += 1; // Tech usually has higher potential yield

            // Clamp scores to 1-10 range
            feasibility = Math.Clamp(feasibility, 1, 10);
            strategic   = Math.Clamp(strategic,   1, 10);
            risk        = Math.Clamp(risk,        1, 10);
            roi         = Math.Clamp(roi,         1, 10);

            // Suggested Budget Calculation
            decimal suggestedBudget = proposal.RequestedAmount;
            if (risk <= 3) suggestedBudget = proposal.RequestedAmount * 0.70m;
            else if (risk <= 5) suggestedBudget = proposal.RequestedAmount * 0.85m;
            suggestedBudget = Math.Round(suggestedBudget, 2);

            // Final Recommendation
            int overallScore = (feasibility + strategic + risk + roi) / 4;
            string recommendation;
            string riskLevel;

            if (overallScore >= 8) { recommendation = "Approve"; riskLevel = "Low"; }
            else if (overallScore >= 6) { recommendation = "Conditional Approve"; riskLevel = "Moderate"; }
            else { recommendation = "Reject"; riskLevel = "High"; }

            // Dynamic String Generation
            string summary = $"The proposal for {proposal.StartupName} in the {domain} sector requests ${proposal.RequestedAmount:N0} for {proposal.EquityOffered:N2}% equity. Based on our evaluation, it presents a {riskLevel.ToLower()} risk profile with a strategic score of {strategic}/10. We recommend a status of {recommendation}.";
            
            string riskAssessment = riskLevel == "High" 
                ? "⚠️ ELEVATED RISK DETECTED. The requested capital versus equity offering ratio, combined with the business model detail provided, indicates significant risk. Mitigation strategies and strict milestone tracking are required."
                : riskLevel == "Moderate" 
                ? "🔶 CONTROLLED RISK PROFILE. Standard operational risk boundaries apply. Ensure vendor SLA compliance and establish regular risk reviews."
                : "✅ MINIMAL RISK EXPOSURE. The structured delivery approach and detailed team capability dramatically reduce execution uncertainty.";

            string roiAnalysis = roi >= 8 
                ? "💰 EXCEPTIONAL ROI PROFILE. The equity offered provides a high potential yield relative to the requested capital in this sector."
                : roi >= 5 
                ? "📊 ACCEPTABLE FINANCIAL RETURN. The projected return is resilient and standard for this class of investment."
                : "📉 WEAK ROI CASE. The financial model and equity offered do not justify the full requested budget under standard capital allocation criteria.";

            // Deterministic Confidence based on input completeness
            int confidence = 70;
            if (!string.IsNullOrWhiteSpace(proposal.DemoVideoUrl)) confidence += 10;
            if (!string.IsNullOrWhiteSpace(proposal.BusinessModel) && proposal.BusinessModel.Length > 50) confidence += 10;
            if (!string.IsNullOrWhiteSpace(proposal.TeamDetails) && proposal.TeamDetails.Length > 50) confidence += 5;
            confidence = Math.Clamp(confidence, 60, 99);

            return new AiAnalysisResult
            {
                FeasibilityScore  = feasibility,
                StrategicScore    = strategic,
                RiskScore         = risk,
                RoiScore          = roi,
                SuggestedBudget   = suggestedBudget,
                Summary           = summary,
                RiskAssessment    = riskAssessment,
                RoiAnalysis       = roiAnalysis,
                Recommendation    = recommendation,
                Confidence        = $"{confidence}%",
                Domain            = domain,
                Suggestion        = "Consider aligning the business model deliverables with clear, measurable quarterly milestones to optimize funding drawdown.",
                AnalysisTimestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC")
            };
        }
    }
}
