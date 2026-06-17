import { useState, useEffect } from 'react';

// ── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text, speed = 18, active = true) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!active || !text) { setDisplayed(''); return; }
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, active]);
  return displayed;
}

// ── Animated score bar component (Light Theme) ──────────────────────────────
function AiScoreBar({ label, score, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score * 10), delay);
    return () => clearTimeout(t);
  }, [score, delay]);
  const pct = score * 10;
  const barColor = pct >= 70 ? color : pct >= 40 ? '#D97706' : '#DC2626';
  return (
    <div className="ai-score-bar-group" style={{ marginBottom: '0.65rem' }}>
      <div className="ai-score-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.82rem', fontWeight: 600, color: '#1E293B' }}>
        <span>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono, monospace)', color: barColor, fontWeight: 700 }}>
          {score}
          <span style={{ fontSize: '0.75em', color: '#64748B' }}>/10</span>
        </span>
      </div>
      <div className="progress-container" style={{ height: '8px', borderRadius: '99px', background: '#E2E8F0', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            borderRadius: '99px',
            width: `${width}%`,
            background: barColor,
            boxShadow: `0 0 8px ${barColor}44`,
            transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)',
          }}
        />
      </div>
    </div>
  );
}

// ── Shared AI Report Modal Component (Light Theme) ───────────────────────────
const LOADING_STEPS = [
  'Scanning proposal metadata…',
  'Vectorising semantic content…',
  'Running Monte-Carlo risk simulation…',
  'Calibrating financial yield model…',
  'Benchmarking against 2,400+ analogues…',
  'Generating recommendation matrix…',
  'Compiling executive report…',
];

export default function AiReportModal({ report, loading, onClose }) {
  const [loadingStep, setLoadingStep] = useState(0);
  
  // Normalise both casing variants from backend
  const summary = report?.summary ?? report?.Summary ?? '';
  const rec  = report?.recommendation ?? report?.Recommendation;
  const recColor = rec === 'Approve' ? '#059669' : rec === 'Conditional Approve' ? '#D97706' : '#DC2626';
  const recBgColor = rec === 'Approve' ? '#ECFDF5' : rec === 'Conditional Approve' ? '#FEF3C7' : '#FEF2F2';
  const recBorderColor = rec === 'Approve' ? '#A7F3D0' : rec === 'Conditional Approve' ? '#FDE68A' : '#FECACA';

  const feas    = report?.feasibilityScore  ?? report?.FeasibilityScore  ?? 0;
  const strat   = report?.strategicScore    ?? report?.StrategicScore    ?? 0;
  const risk    = report?.riskScore         ?? report?.RiskScore         ?? 0;
  const roi     = report?.roiScore          ?? report?.RoiScore          ?? 0;
  const budget  = report?.suggestedBudget   ?? report?.SuggestedBudget   ?? 0;
  const riskTxt = report?.riskAssessment    ?? report?.RiskAssessment    ?? '';
  const roiTxt  = report?.roiAnalysis       ?? report?.RoiAnalysis       ?? '';
  const conf    = report?.confidence        ?? report?.Confidence        ?? '';
  const domain  = report?.domain            ?? report?.Domain            ?? '';
  const ts      = report?.analysisTimestamp ?? report?.AnalysisTimestamp ?? '';
  const suggTxt = report?.suggestion        ?? report?.Suggestion        ?? '';

  const summaryText = useTypewriter(
    loading ? '' : summary,
    14,
    !loading
  );

  // Cycle through loading steps for visual effect
  useEffect(() => {
    if (!loading) return;
    setLoadingStep(0);
    const id = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % LOADING_STEPS.length);
    }, 900);
    return () => clearInterval(id);
  }, [loading]);

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        className="modal-content light-theme"
        style={{
          maxWidth: '680px',
          width: '95vw',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          borderRadius: '16px',
          animation: 'aiModalIn 0.3s ease-out',
          overflow: 'hidden',
          color: '#0F172A'
        }}
      >
        <style>{`
          @keyframes aiModalIn {
            from { opacity: 0; transform: translateY(16px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
          .ai-meta-tag {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 4px 12px; border-radius: 99px;
            font-size: 0.75rem; font-weight: 600; letter-spacing: 0.02em;
            background: #F1F5F9; color: #334155; border: 1px solid #E2E8F0;
          }
          .ai-section {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 1rem 1.15rem;
            margin-bottom: 0.85rem;
          }
          .ai-section h4 {
            font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em;
            text-transform: uppercase; color: #475569; margin: 0 0 0.5rem 0;
          }
          .ai-section p {
            font-size: 0.875rem; color: #0F172A; line-height: 1.6; margin: 0; fontWeight: 500;
          }
          .ai-loading-bar-light {
            height: 3px;
            background: linear-gradient(90deg, transparent, #2563EB, #0891B2, transparent);
            background-size: 200% 100%;
            animation: shimmerLight 1.5s linear infinite;
          }
          @keyframes shimmerLight { from { background-position: -200% 0; } to { background-position: 200% 0; } }
          @keyframes spinSlow { to { transform: rotate(360deg); } }
        `}</style>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #2563EB, #0284C7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(37,99,235,0.25)', color: '#FFFFFF'
            }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0F172A', letterSpacing: '-0.01em' }}>AI Decision Engine</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Autonomous Proposal Evaluator v2.4</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9', border: '1px solid #E2E8F0',
              color: '#475569', borderRadius: 8, width: 32, height: 32,
              cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, transition: 'all 0.15s'
            }}
          >✕</button>
        </div>

        {/* Running progress line */}
        {loading && <div className="ai-loading-bar-light" />}

        {/* Body */}
        <div style={{ padding: '1.25rem 1.5rem', maxHeight: '72vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              {/* Spinning orb (Light Theme) */}
              <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 1.25rem' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  border: '3px solid #E2E8F0',
                  borderTopColor: '#2563EB', borderRightColor: '#0891B2',
                  animation: 'spinSlow 0.9s linear infinite',
                  position: 'absolute', top: 0, left: 0
                }} />
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  border: '2px solid #F1F5F9',
                  borderBottomColor: '#0284C7',
                  animation: 'spinSlow 1.4s linear infinite reverse',
                  position: 'absolute', top: 10, left: 10
                }} />
              </div>
              <p style={{ color: '#1E293B', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {LOADING_STEPS[loadingStep]}
              </p>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: '1rem' }}>
                {LOADING_STEPS.map((_, i) => (
                  <div key={i} style={{
                    width: i === loadingStep ? 18 : 6, height: 6,
                    borderRadius: 99,
                    background: i === loadingStep ? '#2563EB' : '#CBD5E1',
                    transition: 'all 0.3s'
                  }} />
                ))}
              </div>
            </div>
          ) : report && !report.error ? (
            <>
              {/* Meta tags row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {domain && <span className="ai-meta-tag">📁 {domain}</span>}
                {conf   && <span className="ai-meta-tag">🎯 Confidence {conf}</span>}
                {ts     && <span className="ai-meta-tag">🕐 {ts}</span>}
              </div>

              {/* Recommendation + Budget Header Card */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '0.75rem', padding: '1rem 1.15rem',
                background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 1.25rem', borderRadius: 99,
                  background: recBgColor,
                  border: `1px solid ${recBorderColor}`,
                  color: recColor, fontWeight: 700, fontSize: '0.95rem'
                }}>
                  {rec === 'Approve' ? '✅' : rec === 'Conditional Approve' ? '⚡' : '❌'}
                  {rec}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>AI Suggested Budget</div>
                  <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '1.25rem', color: '#0F172A', fontWeight: 800 }}>
                    {budget?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="ai-section">
                <h4>🧠 Executive Summary</h4>
                <p style={{ minHeight: '2.5em', color: '#0F172A' }}>{summaryText}</p>
              </div>

              {/* Score bars */}
              <div className="ai-section" style={{ background: '#FFFFFF' }}>
                <h4 style={{ marginBottom: '0.75rem' }}>📊 Strategic Evaluation Scores</h4>
                <AiScoreBar label="⚙️ Technical Feasibility" score={feas} color="#2563EB" delay={100} />
                <AiScoreBar label="🎯 Strategic Alignment"   score={strat} color="#0891B2" delay={250} />
                <AiScoreBar label="🛡️ Risk Safety Index"      score={risk} color="#059669" delay={400} />
                <AiScoreBar label="💰 ROI Potential"          score={roi}  color="#D97706" delay={550} />
              </div>

              {/* Risk Assessment */}
              <div className="ai-section">
                <h4>⚠️ Risk Factor Profile</h4>
                <p>{riskTxt}</p>
              </div>

              {/* ROI Analysis */}
              <div className="ai-section">
                <h4>📈 Financial Yield Analysis</h4>
                <p>{roiTxt}</p>
              </div>

              {/* Actionable Suggestion */}
              {suggTxt && (
                <div className="ai-section" style={{ borderLeft: '4px solid #2563EB' }}>
                  <h4 style={{ color: '#2563EB' }}>💡 Actionable Suggestion</h4>
                  <p>{suggTxt}</p>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '2.5rem', textAlign: 'center', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
              <p style={{ color: '#DC2626', fontWeight: '700', fontSize: '0.95rem' }}>
                {report?.error || 'AI Engine returned no data. Please try again.'}
              </p>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem' }}>
                Please make sure the backend service is active and accessible.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #F1F5F9',
            background: '#F8FAFC',
            display: 'flex', justifyContent: 'flex-end', gap: '0.75rem'
          }}>
            <button
              onClick={onClose}
              style={{
                borderRadius: 8,
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.55rem 1.25rem',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#334155',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
