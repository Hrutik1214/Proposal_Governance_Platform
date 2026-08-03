# AWS Production Deployment Guide

This document provides complete instructions for building, configuring, and deploying the **InnovAura — Proposal Governance & Startup Investment Platform** to AWS (EC2, RDS MySQL, S3, CloudFront).

---

## 1. Prerequisites
- **AWS Account** with access to EC2, RDS, S3, and Route 53 / CloudFront.
- **Docker** & **Docker Compose** installed on EC2 instance or local deployment machine.
- **.NET 10 SDK** (for manual backend publishing).
- **Node.js 20+** & **npm** (for manual frontend building).
- **Git** (for code checkout).

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env` and fill in production secrets:

```bash
cp .env.example .env
```

### Essential Production Variables
| Variable | Description | Example / Recommended Value |
|---|---|---|
| `MYSQL_DATABASE` | Database name | `proposal_governance` |
| `MYSQL_USER` | Production database user | `governance_user` |
| `MYSQL_PASSWORD` | Database user password | *Strong generated password* |
| `MYSQL_ROOT_PASSWORD` | MySQL root user password | *Strong generated password* |
| `DATABASE_CONNECTION_STRING` | MySQL Connection String | `Server=mysql-db;Port=3306;Database=proposal_governance;User Id=governance_user;Password=SecuredPass;` |
| `JWT_KEY` | JWT Signing Key (Min 256-bits) | *High entropy base64 string* |
| `GEMINI_API_KEY` | Google Gemini AI Key | `AIzaSy...` |
| `STORAGE_PROVIDER` | Storage provider mode | `Local` or `S3` |
| `S3_BUCKET_NAME` | AWS S3 Bucket Name | `innovaura-proposal-documents-prod` |

---

## 3. Docker Deployment (Recommended)

To spin up MySQL, the .NET Backend API, and the Nginx Frontend SPA in isolated production containers:

### Step 1: Build & Launch Containers
```bash
docker compose --env-file .env up -d --build
```

### Step 2: Verify Container Status
```bash
docker compose ps
```

### Step 3: View Container Logs
```bash
docker compose logs -f backend-api
```

---

## 4. Manual Production Build Commands

If deploying without Docker Compose:

### Frontend Production Build
```bash
cd frontend
npm ci
npm run build
# Production assets will be emitted in frontend/dist/
```

### Backend Production Publication
```bash
cd backend/ProposalGovernance.Api
dotnet publish -c Release -o ./publish /p:UseAppHost=false
# Compiled binaries will be emitted in backend/ProposalGovernance.Api/publish/
```

---

## 5. Health Checks & Verification Endpoints

The API exposes production health endpoints suitable for AWS ALB (Application Load Balancer) Target Group health checks:

- **Liveness Health Check**: `GET http://<your-domain-or-ip>:5031/health`
- **Readiness Health Check**: `GET http://<your-domain-or-ip>:5031/ready`

Expected Response:
```
HTTP/1.1 200 OK
Healthy
```

---

## 6. Future AWS S3 Migration Notes

The platform features an abstract file storage layer (`IFileStorageService` in `Services/IFileStorageService.cs`).

To migrate file uploads from local disk storage (`wwwroot/uploads`) to AWS S3:
1. Create an AWS S3 Bucket (e.g. `innovaura-proposal-documents-prod`).
2. Add `AWSSDK.S3` package to `ProposalGovernance.Api.csproj`.
3. Set environment variable `STORAGE_PROVIDER=S3` in `.env` or AWS Parameter Store.
4. Zero code changes are required in business controllers or frontend pages.
