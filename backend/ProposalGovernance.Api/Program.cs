using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using ProposalGovernance.Api.Data;
using ProposalGovernance.Api.Hubs;
using ProposalGovernance.Api.Repositories;
using ProposalGovernance.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

// Render dynamic PORT binding support
var renderPort = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(renderPort))
{
    builder.WebHost.UseUrls($"http://*:{renderPort}");
}

// Database configuration (MySQL with SQLite automatic fallback for zero-config deployments)
builder.Services.AddDbContext<GovernanceDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    bool isPlaceholderOrLocal = string.IsNullOrWhiteSpace(connectionString)
        || connectionString.Contains("your-db-host")
        || connectionString.Contains("your_db_user");

    if (isPlaceholderOrLocal)
    {
        var dbPath = Path.Combine(builder.Environment.ContentRootPath, "governance.db");
        options.UseSqlite($"Data Source={dbPath}");
    }
    else
    {
        options.UseMySql(connectionString!, new MySqlServerVersion(new Version(8, 0, 34)));
    }
});

// Dependency Injection - Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProposalRepository, ProposalRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<ICapitalRepository, CapitalRepository>();
builder.Services.AddScoped<IInvestmentRepository, InvestmentRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<ISocialRepository, SocialRepository>();
builder.Services.AddScoped<IMarketplaceRepository, MarketplaceRepository>();
builder.Services.AddScoped<IDiscussionRepository, DiscussionRepository>();

// Dependency Injection - Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddSingleton<IEmailService, EmailService>(); // Singleton to keep mock logs in memory if needed (writes to file anyway)
builder.Services.AddHttpClient(); // Generic HttpClient registration
builder.Services.AddScoped<IAiAnalysisService, AiAnalysisService>();
builder.Services.AddHttpClient<AiAnalysisService>(); // HttpClient for Gemini API calls
builder.Services.AddScoped<IPatentVerificationService, PatentVerificationService>();
builder.Services.AddHttpClient<PatentVerificationService>(); // HttpClient for Patent Verification API/Gemini calls

// New Scoped Services
builder.Services.AddScoped<IPaymentService, RazorpayPaymentService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<ITrustScoreService, TrustScoreService>();
builder.Services.AddScoped<INdaService, NdaService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IVisibilityScoreService, VisibilityScoreService>();

// Storage Abstraction registration
var storageProvider = builder.Configuration["Storage:Provider"] ?? "Local";
if (storageProvider.Equals("S3", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddScoped<IFileStorageService, S3StorageProvider>();
}
else
{
    builder.Services.AddScoped<IFileStorageService, LocalStorageProvider>();
}

// Production Health Checks registration
builder.Services.AddHealthChecks();

// SignalR for real-time notifications
builder.Services.AddSignalR();

// Swagger UI and OpenAPI generation setup
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "InnovAura API",
        Version = "v1",
        Description = "API documentation for InnovAura — Proposal Governance & Startup Investment Platform."
    });

    // Configure JWT authentication for Swagger
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "JWT Authentication",
        Description = "Enter JWT Bearer token **_only_**",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    };
    c.AddSecurityDefinition("Bearer", securityScheme);
    c.AddSecurityRequirement((document) => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer", document),
            new List<string>()
        }
    });
});

// JWT Authentication configuration
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") ?? builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "ProposalGovernanceApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "ProposalGovernanceClient";

if (string.IsNullOrWhiteSpace(jwtKey))
{
    jwtKey = builder.Environment.IsDevelopment()
        ? "DevelopmentOnlySuperSecretKeyForLocalTesting"
        : throw new InvalidOperationException("JWT signing key is not configured. Set Jwt:Key or the JWT_KEY environment variable.");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };

    // Custom logic to read SignalR token from query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        var allowedOriginsEnv = Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS");
        var customOrigins = allowedOriginsEnv?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        if (customOrigins != null && customOrigins.Length > 0)
        {
            policy.WithOrigins(customOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            policy.SetIsOriginAllowed(_ => true)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "InnovAura API v1");
        c.RoutePrefix = "swagger"; // Standard URL path: http://localhost:5031/swagger
    });
}
else
{
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
            var exception = exceptionHandlerPathFeature?.Error;
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            
            string errorDetails = exception?.Message ?? "An internal server error occurred.";
            if (errorDetails.Contains("your-db-host") || errorDetails.Contains("Unable to connect"))
            {
                errorDetails = "Database Connection Failed: Render cannot connect to MySQL database. Please update 'ConnectionStrings__DefaultConnection' in Render Environment Variables with valid MySQL credentials.";
            }

            var jsonResponse = System.Text.Json.JsonSerializer.Serialize(new { message = errorDetails });
            await context.Response.WriteAsync(jsonResponse);
        });
    });
}

app.UseStaticFiles(); // Serve static assets (e.g. uploaded proposal PDFs)

app.UseResponseCompression();
app.UseRouting();

app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapHealthChecks("/health");
app.MapHealthChecks("/ready");

// Automatically initialize the database on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<GovernanceDbContext>();
        context.Database.EnsureCreated();

        try
        {
            context.Database.ExecuteSqlRaw("ALTER TABLE `Users` ADD COLUMN IF NOT EXISTS `ContactNumber` VARCHAR(20) NOT NULL DEFAULT '';");
        }
        catch
        {
            try
            {
                context.Database.ExecuteSqlRaw("ALTER TABLE `Users` ADD COLUMN `ContactNumber` VARCHAR(20) NOT NULL DEFAULT '';");
            }
            catch { /* Column already exists */ }
        }

        try
        {
            context.Database.ExecuteSqlRaw(@"
                CREATE TABLE IF NOT EXISTS `Subscriptions` (
                    `Id` INT NOT NULL AUTO_INCREMENT,
                    `Name` VARCHAR(100) NOT NULL,
                    `UserRole` VARCHAR(50) NOT NULL,
                    `Price` DECIMAL(18,2) NOT NULL,
                    `DurationInDays` INT NOT NULL,
                    `Description` VARCHAR(500) NOT NULL DEFAULT '',
                    `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
                    PRIMARY KEY (`Id`)
                );
            ");

            context.Database.ExecuteSqlRaw(@"
                CREATE TABLE IF NOT EXISTS `UserSubscriptions` (
                    `Id` INT NOT NULL AUTO_INCREMENT,
                    `UserId` INT NOT NULL,
                    `SubscriptionId` INT NOT NULL,
                    `StartDate` DATETIME NOT NULL,
                    `EndDate` DATETIME NOT NULL,
                    `Status` VARCHAR(50) NOT NULL DEFAULT 'Active',
                    `PaymentId` VARCHAR(100) NULL,
                    `GrantedMethod` VARCHAR(50) NULL,
                    `UpdatedAt` DATETIME NULL,
                    `TotalReviewerConsultations` INT NOT NULL DEFAULT 0,
                    `RemainingReviewerConsultations` INT NOT NULL DEFAULT 0,
                    `LastConsultationResetDate` DATETIME NULL,
                    PRIMARY KEY (`Id`)
                );
            ");

            context.Database.ExecuteSqlRaw(@"
                CREATE TABLE IF NOT EXISTS `SubscriptionHistories` (
                    `Id` INT NOT NULL AUTO_INCREMENT,
                    `UserId` INT NOT NULL,
                    `Action` VARCHAR(100) NOT NULL,
                    `OldPlan` VARCHAR(100) NULL,
                    `NewPlan` VARCHAR(100) NULL,
                    `ChangedByAdminId` INT NULL,
                    `Reason` VARCHAR(500) NULL,
                    `CreatedAt` DATETIME NOT NULL,
                    PRIMARY KEY (`Id`)
                );
            ");

            context.Database.ExecuteSqlRaw(@"
                CREATE TABLE IF NOT EXISTS `PlatformConfigs` (
                    `Id` INT NOT NULL AUTO_INCREMENT,
                    `Key` VARCHAR(100) NOT NULL,
                    `Value` VARCHAR(500) NOT NULL,
                    `UpdatedAt` DATETIME NOT NULL,
                    `UpdatedByAdminId` INT NULL,
                    PRIMARY KEY (`Id`)
                );
            ");

            context.Database.ExecuteSqlRaw(@"
                INSERT INTO `Subscriptions` (`Id`, `Name`, `UserRole`, `Price`, `DurationInDays`, `Description`, `IsActive`)
                SELECT 1, 'Founder Free', 'Founder', 0.00, 9999, 'Standard listing and interest requests.', 1
                WHERE NOT EXISTS (SELECT 1 FROM `Subscriptions` WHERE `Id` = 1);

                INSERT INTO `Subscriptions` (`Id`, `Name`, `UserRole`, `Price`, `DurationInDays`, `Description`, `IsActive`)
                SELECT 2, 'Founder Premium', 'Founder', 20.00, 30, 'Priority listing, visibility boost, verified badge, and priority consultation.', 1
                WHERE NOT EXISTS (SELECT 1 FROM `Subscriptions` WHERE `Id` = 2);

                INSERT INTO `Subscriptions` (`Id`, `Name`, `UserRole`, `Price`, `DurationInDays`, `Description`, `IsActive`)
                SELECT 3, 'Investor Free', 'Investor', 0.00, 9999, 'Standard browse, view public proposals, and request access.', 1
                WHERE NOT EXISTS (SELECT 1 FROM `Subscriptions` WHERE `Id` = 3);

                INSERT INTO `Subscriptions` (`Id`, `Name`, `UserRole`, `Price`, `DurationInDays`, `Description`, `IsActive`)
                SELECT 4, 'Investor Premium', 'Investor', 20.00, 30, 'Advanced filters, comparisons, risk reports, and trust breakdown.', 1
                WHERE NOT EXISTS (SELECT 1 FROM `Subscriptions` WHERE `Id` = 4);

                UPDATE `Subscriptions` SET `Price` = 20.00 WHERE `Id` IN (2, 4);
            ");
        }
        catch { /* Table or seed already initialized */ }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred initializing the database schema.");
    }
}

app.Run();
