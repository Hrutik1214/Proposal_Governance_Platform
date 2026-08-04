# AWS EC2 Ubuntu Production Deployment Guide

This document provides complete instructions for building, configuring, and deploying the **InnovAura — Proposal Governance & Startup Investment Platform** to AWS EC2 Ubuntu Server at Elastic IP **`13.203.82.193`**.

---

## 1. Server & Elastic IP Overview
- **AWS Region**: ap-south-1 (Mumbai)
- **Elastic IP Address**: `13.203.82.193`
- **OS**: Ubuntu Server 22.04 LTS
- **Frontend URL**: `http://13.203.82.193:5173` (or port 80 via Nginx)
- **Spring Boot API URL**: `http://13.203.82.193:8080/api`
- **ASP.NET Infrastructure API**: `http://13.203.82.193:5031`
- **SignalR Notification Hub**: `http://13.203.82.193:5031/hubs/notifications`

---

## 2. AWS Security Group Configuration

Ensure the following inbound rules are open in your AWS EC2 Security Group (`sg-innovaura`):

| Type | Protocol | Port Range | Source | Purpose |
|---|---|---|---|---|
| SSH | TCP | 22 | My IP / Anywhere | Terminal SSH Management |
| HTTP | TCP | 80 | Anywhere (`0.0.0.0/0`) | Production Web Access |
| Custom TCP | TCP | 8080 | Anywhere (`0.0.0.0/0`) | Spring Boot REST API |
| Custom TCP | TCP | 5173 | Anywhere (`0.0.0.0/0`) | React Frontend Dev Server |
| Custom TCP | TCP | 5031 | Anywhere (`0.0.0.0/0`) | ASP.NET SignalR & Files |
| MySQL | TCP | 3306 | Localhost / EC2 Security Group | Shared Database |

---

## 3. EC2 Initial Ubuntu Server Setup

SSH into your AWS EC2 instance:
```bash
ssh -i "KeyPair.pem" ubuntu@13.203.82.193
```

Update system dependencies and install Java 17, Maven, Node.js 20, and MySQL 8:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y openjdk-17-jdk maven nodejs npm mysql-server
```

---

## 4. Environment Variables Setup

Create your production `.env` file on EC2:
```bash
cp .env.example .env
```

Set AWS EC2 Elastic IP:
```env
VITE_API_URL=http://13.203.82.193:8080/api
VITE_SIGNALR_URL=http://13.203.82.193:5031/hubs/notifications
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/proposal_governance?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=Atharv@2002
CORS_ALLOWED_ORIGINS=http://13.203.82.193,http://13.203.82.193:5173,http://13.203.82.193:8080,http://13.203.82.193:5031
```

---

## 5. Launching Services on EC2

### Step 1: Start Spring Boot Backend (Port 8080)
```bash
cd backend/innovAura-backend
nohup mvn spring-boot:run > spring-backend.log 2>&1 &
```

### Step 2: Start ASP.NET Core Infrastructure (Port 5031)
```bash
cd backend/ProposalGovernance.Api
nohup dotnet run > dotnet-backend.log 2>&1 &
```

### Step 3: Start React Frontend (Port 5173 / Port 80)
```bash
cd frontend
npm ci
nohup npm run dev -- --host 0.0.0.0 --port 5173 > frontend.log 2>&1 &
```

---

## 6. Health Check Endpoints

- **Spring Boot Health**: `GET http://13.203.82.193:8080/actuator/health`
- **Swagger Documentation**: `GET http://13.203.82.193:8080/swagger-ui.html`
- **SignalR Hub Status**: `GET http://13.203.82.193:5031/hubs/notifications`
