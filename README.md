# GRACE AI

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-8-red)

**Smart Grievance Resolution. Transparent Governance.**

AI-Powered Grievance Redressal & SLA Enforcement Platform

> GRACE AI transforms citizen grievances into intelligent, trackable and data-driven governance actions.

> **GRACE AI is a hackathon demonstration platform and is not an official government service.**

📋 **[Hackathon Submission Package](./HACKATHON_SUBMISSION.md)** — abstract, demo script, slides, judge Q&A, checklist

---

## Overview

GRACE AI is a full-stack GovTech MVP for intelligent grievance handling. Citizens submit complaints, receive AI-assisted classification and routing insights, and track resolution in real time. Authorities manage assignments, monitor SLAs, detect duplicates, and analyze trends — all persisted in MongoDB Atlas.

**Status: WORKING HACKATHON MVP**

Current implementation is a working hackathon MVP built around React, Node.js, Express, MongoDB Atlas and modular rule-based AI services. The architecture is intentionally designed so the demonstration AI layer can later be replaced by production NLP/ML models such as BERT or DistilBERT without rewriting the core grievance workflow.

---

## Problem

Citizens often lack visibility into grievance status. Municipal departments receive duplicate complaints, miss SLA deadlines, and struggle to prioritize work without data-driven insights.

---

## Solution

GRACE AI connects citizens and authorities through a shared MongoDB-backed workflow:

**Citizen → AI Analysis → MongoDB → Authority → MongoDB → Citizen**

The platform provides classification, department routing, duplicate detection, SLA prediction, citizen tracking, authority workflow, analytics, root-cause intelligence, forecasting, and governance recommendations.

---

## Features

- Citizen registration, login, and grievance submission
- Rule-based AI analysis (category, department, priority, duplicate probability, SLA risk)
- Grievance tracking with MongoDB-backed status timeline
- Authority command center (search, assign, status updates)
- Officer assignment by department
- Duplicate cluster management
- SLA monitoring and predictions
- Real-time notifications for citizens and authorities
- Analytics dashboard (trends, departments, categories, SLA, hotspots, forecast, root causes)
- Policy impact and AI governance recommendations (demo data)
- Role-based access control (Citizen, Authority, Admin, Officer)
- Production-ready deployment configuration (Vercel + Render/Railway + MongoDB Atlas)

---

## Architecture

```
Citizen / Authority
        ↓
React + TypeScript (Vite)
        ↓
HTTPS REST API
        ↓
Node.js + Express
        ↓
Service Layer
   ↙          ↘
AI Services   Mongoose
        ↓
MongoDB Atlas
```

**AI services (modular, replaceable):**

- Classification
- Routing
- Duplicate Detection
- SLA Prediction
- Root Cause Rules
- Forecasting
- Recommendations

The frontend **never** connects directly to MongoDB.

---

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide |
| Backend | Node.js, Express, TypeScript, Zod, JWT, bcrypt, Helmet |
| Database | MongoDB Atlas, Mongoose |
| AI (MVP) | Deterministic rule-based inference engine (`RULE_BASED_DEMO`) |

---

## Project Structure

```
grace-ai/
├── frontend/          # React + Vite SPA (deploy to Vercel)
├── backend/           # Express API (deploy to Render/Railway)
├── .env.example       # Backend environment template (root)
├── docker-compose.yml # Optional backend container
└── package.json       # Root scripts (dev, build, seed)
```

---

## MongoDB Models

| Collection | Purpose |
|------------|---------|
| `User` | Citizens, authorities, officers, admins (bcrypt passwords) |
| `CitizenProfile` | Citizen address and ward preferences |
| `Department` | Municipal departments |
| `Officer` | Field officers linked to departments and wards |
| `ComplaintCategory` | Categories with default department routing |
| `Ward` | City wards / zones |
| `Grievance` | Complaint records with SLA deadlines |
| `GrievanceStatusHistory` | Status transition timeline |
| `AIAnalysis` | Rule-based analysis results |
| `DuplicateMatch` | Duplicate clusters with similarity scores |
| `SLAPrediction` | SLA risk predictions |
| `Notification` | Citizen and authority notifications |
| `AnalyticsSnapshot` | Aggregated dashboard metrics |
| `PolicyImpact` | Seeded policy impact demo records |
| `AIRecommendation` | Governance recommendations |

**Key relationships:** `Grievance` → `User` (citizen), `Department`, `Officer`, `Ward`, `ComplaintCategory`; linked `AIAnalysis`, `SLAPrediction`, `DuplicateMatch`, `GrievanceStatusHistory`, `Notification`.

---

## AI Architecture

The current AI implementation uses a **deterministic rule-based inference engine** designed to simulate the architecture of a future NLP/ML service. It does **not** run BERT, DistilBERT, or trained models in this MVP.

The service layer is modular and can later be replaced by:

- BERT / DistilBERT classifiers
- Embedding-based duplicate detection
- Trained SLA prediction models
- Production forecasting pipelines

**Forecasting disclaimer:** Forecasting currently uses a simple statistical prototype method (`MOVING_AVERAGE_DEMO`) based on historical complaint data. It is not a trained production forecasting model.

**Policy impact disclaimer:** Policy impact examples are seeded demonstration records for the hackathon MVP. They do not represent actual government policy outcomes.

---

## Authentication

- JWT bearer tokens stored in browser `localStorage` (`grace_token`)
- bcrypt password hashing
- Role-based authorization: `CITIZEN`, `AUTHORITY`, `ADMIN`, `OFFICER`
- Login rate limiting (429 after threshold)
- Production `JWT_SECRET` must differ from development/demo values

---

## API Documentation

Base URL: `http://localhost:5000/api` (local) or `https://<BACKEND_API_URL>/api` (production)

### Authentication

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register` | Public |
| GET | `/api/auth/me` | Authenticated |
| POST | `/api/auth/logout` | Authenticated |

### Grievances

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/grievances` | Citizen |
| GET | `/api/grievances` | Authority, Admin |
| GET | `/api/grievances/my` | Citizen |
| GET | `/api/grievances/:id` | Authenticated (scoped) |
| PATCH | `/api/grievances/:id/status` | Authority, Admin |
| PATCH | `/api/grievances/:id/assign` | Authority, Admin |
| GET | `/api/grievances/:id/timeline` | Authenticated (scoped) |
| GET | `/api/grievances/:id/duplicates` | Authenticated (scoped) |
| GET | `/api/grievances/:id/sla` | Authenticated (scoped) |

### AI

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/ai/analyze-grievance` | Citizen |
| GET | `/api/ai/recommendations` | Authority, Admin |

### Analytics

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/analytics/overview` | Authority, Admin |
| GET | `/api/analytics/trends` | Authority, Admin |
| GET | `/api/analytics/departments` | Authority, Admin |
| GET | `/api/analytics/categories` | Authority, Admin |
| GET | `/api/analytics/sla` | Authority, Admin |
| GET | `/api/analytics/hotspots` | Authority, Admin |
| GET | `/api/analytics/forecast` | Authority, Admin |
| GET | `/api/analytics/root-causes` | Authority, Admin |
| GET | `/api/analytics/policy-impact` | Authority, Admin |
| GET | `/api/analytics/citizen-overview` | Citizen |
| GET | `/api/analytics/authority-overview` | Authority, Admin |
| GET | `/api/analytics/sla-monitoring` | Authority, Admin |

### Officers

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/officers` | Authority, Admin |
| GET | `/api/officers/:id` | Authority, Admin |
| GET | `/api/officers/department/:departmentId` | Authority, Admin |

### Duplicates

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/duplicates` | Authority, Admin |
| PATCH | `/api/duplicates/:id` | Authority, Admin |

### Notifications

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/notifications` | Authenticated |
| GET | `/api/notifications/unread-count` | Authenticated |
| PATCH | `/api/notifications/:id/read` | Authenticated |

### Reference Data

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/categories` | Authenticated |
| GET | `/api/wards` | Authenticated |

### Health

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/health` | Public |

Returns `503` with `database: disconnected` when MongoDB is unavailable.

---

## Local Setup

**Prerequisites:** Node.js 18+, MongoDB Atlas account (or compatible MongoDB URI)

1. Clone the repository.
2. Install root dependencies:
   ```bash
   npm run install:all
   ```
3. Create backend environment file at project root:
   ```bash
   cp .env.example .env
   ```
4. Configure `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL` in `.env`.
5. Create frontend environment file:
   ```bash
   cp frontend/.env.example frontend/.env
   ```
6. Seed the database:
   ```bash
   npm run seed
   ```
7. Start both servers:
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000
   - Health: http://localhost:5000/api/health

---

## MongoDB Atlas Setup

1. Create a [MongoDB Atlas](https://www.mongodb.com/atlas) account.
2. Create a free cluster.
3. Create a database user (username + password).
4. Configure **Network Access** — for hackathon demos, allow access from anywhere (`0.0.0.0/0`) or add your backend host IP (Render/Railway egress).
5. Copy the connection string from Atlas → Connect → Drivers.
6. Set in root `.env` (example only — do not commit real credentials):
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
   ```
7. Run the seed:
   ```bash
   npm run seed
   ```

Do not commit real Atlas credentials to source control.

---

## Environment Variables

### Backend (root `.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Strong secret for JWT signing |
| `CLIENT_URL` | Yes | Frontend origin(s), comma-separated for multiple |
| `PORT` | No | Server port (default: `5000`) |
| `NODE_ENV` | No | `development` or `production` |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes (prod) | Backend API base URL, e.g. `https://<BACKEND_API_URL>/api` |

Missing required backend variables in production cause startup to fail safely without logging secret values.

---

## Seed Database

```bash
npm run seed
```

The seed connects to the configured `MONGODB_URI` and creates:

- Users, departments, officers, categories, wards
- 50+ grievances with varied statuses
- AI analyses, SLA predictions, duplicate matches
- Status histories, notifications, policy impact, recommendations

**Warning:** `npm run seed` is intended for demo/development databases only. It clears and recreates seeded collections. **Do not run on production data.**

---

## Demo Accounts

Password for all demo accounts: **`Demo@1234`**

| Role | Email |
|------|-------|
| Citizen | `citizen@grace.demo` |
| Authority | `authority@grace.demo` |
| Roads Officer | `roads.officer@grace.demo` |
| Water Officer | `water.officer@grace.demo` |
| Sanitation Officer | `sanitation.officer@grace.demo` |

These are demonstration accounts only.

---

## Running the Application

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + backend concurrently |
| `npm run dev:frontend` | Frontend only (port 5173) |
| `npm run dev:backend` | Backend only (port 5000) |
| `npm run build` | Build backend + frontend |
| `npm run seed` | Seed MongoDB with demo data |

### Backend scripts (`backend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled production server |
| `npm run seed` | Seed database |

### Frontend scripts (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

---

## Testing

### API smoke test (local)

```bash
# Health (no auth)
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"authority@grace.demo","password":"Demo@1234"}'

# Use returned token for authenticated routes
curl http://localhost:5000/api/analytics/overview \
  -H "Authorization: Bearer <token>"
```

Authenticated routes reject requests without a valid token (401).

---

## Deployment

### Deployment Readiness (from `package.json`)

| Component | Build | Start | Seed |
|-----------|-------|-------|------|
| **Root** | `npm run build` | `npm run dev` | `npm run seed` |
| **Frontend (Vite/React)** | `npm run build` → `dist/` | `npm run dev` (5173) | — |
| **Backend (Express/TS)** | `npm run build` → `dist/` | `npm run start` | `npm run seed` |

**API base URL:** configured via `VITE_API_URL` (frontend) — e.g. `https://<backend-domain>/api`  
**Backend env:** `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV`, `PORT`

### Architecture

```
User → Vercel (React) → HTTPS → Render (Express) → MongoDB Atlas
```

**Placeholders (replace after deployment):**

- Frontend: `<VERCEL_FRONTEND_URL>`
- Backend: `<BACKEND_API_URL>`
- MongoDB: configured via `MONGODB_URI` environment variable

### Deployment Order

Follow this sequence:

1. **MongoDB Atlas** — create cluster, user, network access, copy connection string
2. **Backend (Render)** — deploy API, set environment variables
3. **Backend health check** — verify `GET https://<BACKEND>/api/health`
4. **Seed demo database** — run `npm run seed` against Atlas URI (demo DB only)
5. **Frontend (Vercel)** — deploy SPA, set `VITE_API_URL`
6. **Update `CLIENT_URL`** on backend to your Vercel URL (fixes CORS)
7. **Test login** — citizen and authority demo accounts
8. **Test full workflow** — create grievance → authority update → citizen sees change

### Frontend — Vercel

1. Import the repository in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://<BACKEND_API_URL>/api
   ```
6. `frontend/vercel.json` configures SPA rewrites so these routes work on direct access/refresh:
   - `/login`
   - `/citizen/dashboard`
   - `/authority/dashboard`
   - `/authority/analytics`
   - `/track/:grievanceId`

### Backend — Render (recommended)

Use `backend/render.yaml` or configure manually:

1. Create a new **Web Service** on [Render](https://render.com).
2. Set **Root Directory** to `backend`.
3. Build command: `npm install && npm run build`
4. Start command: `npm run start`
5. Environment variables:

   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
   JWT_SECRET=<strong-production-secret>
   PORT=5000
   CLIENT_URL=https://<VERCEL_FRONTEND_URL>
   NODE_ENV=production
   ```

6. Ensure MongoDB Atlas **Network Access** allows Render (use `0.0.0.0/0` for hackathon demo).
7. After deploy, verify: `curl https://<BACKEND_API_URL>/api/health`

### Backend — Railway (alternative)

1. Create project from GitHub repo.
2. Set root/service directory to `backend`.
3. Build: `npm install && npm run build`
4. Start: `npm run start`
5. Set the same environment variables as Render above.

### Seed Production Demo Database

After Atlas and backend are configured:

```bash
# Set MONGODB_URI in root .env to your Atlas demo database, then:
npm run seed
```

Verify MongoDB contains: users, departments, officers, categories, wards, 50+ grievances, AI analyses, SLA predictions, duplicate matches, status histories, notifications, policy impact, recommendations.

**Warning:** The seed script resets demo collections. Use only on the hackathon demo database — **never** on a database containing real citizen data.

### CORS

Backend uses `CLIENT_URL` (not `origin: "*"`). After Vercel deploy, set:

```
CLIENT_URL=https://<VERCEL_FRONTEND_URL>
```

For preview deployments, use comma-separated origins:

```
CLIENT_URL=https://grace-ai.vercel.app,https://grace-ai-git-main.vercel.app
```

---

## Security

- bcrypt password hashing
- JWT authentication with environment-based secret
- Role-based authorization on all protected routes
- Zod request validation
- Mongoose schema validation
- CORS restricted to `CLIENT_URL` (not `*`)
- Helmet security headers
- Login rate limiting (429)
- JSON body limit (1 MB)
- Production errors do not expose stack traces, MongoDB URIs, or JWT secrets
- Citizens can only access their own grievances
- Analytics restricted to authority/admin roles

---

## AI Limitations

- Rule-based keyword/pattern inference — not trained NLP
- Duplicate detection uses heuristic similarity — not embedding models
- SLA prediction uses demo rules — not ML regression
- Forecasting uses moving-average prototype — not production time-series models
- Policy impact records are seeded demonstrations

---

## Future Architecture

Replace the rule-based AI service layer with:

- BERT/DistilBERT text classifiers
- Sentence embedding duplicate detection
- Trained SLA and forecasting models
- External ML inference services (Python/FastAPI, cloud ML APIs)

The grievance workflow, MongoDB models, and REST API contracts are designed to remain stable during this upgrade.

---

## 5-Minute Judge Demo

### 0:00 — Problem

Government grievances are often manually classified, incorrectly routed, and difficult for citizens to track.

### 0:30 — GRACE AI

Introduce: AI classification, smart routing, duplicate detection, SLA prediction, transparent tracking, governance analytics.

### 1:00 — Citizen

1. Open deployed frontend → click **Enter Citizen Demo**
2. Login: `citizen@grace.demo` / `Demo@1234`
3. **Register Grievance**
4. Title: *Large pothole near school*
5. Description: *There is a large pothole near the school entrance and several vehicles are getting damaged.*
6. Category: **Road Infrastructure** · select a ward · enter location
7. Click **Analyze with GRACE AI** — show category, department, priority, duplicate probability, SLA risk, AI confidence, recommendation
8. Submit → show generated `GRV-2026-XXXX`

### 2:00 — Persistence

Open tracking. Show MongoDB-backed timeline. Say: *"The complaint is now persisted in MongoDB."*

### 2:30 — Authority

1. Logout → **Enter Authority Demo** (`authority@grace.demo` / `Demo@1234`)
2. Open Command Center → search exact grievance ID
3. Say: *"This is the same grievance retrieved from the backend database."*
4. Show AI analysis, SLA, duplicates, timeline
5. Assign **Roads Officer** → set status **IN_PROGRESS**

### 3:30 — Citizen Transparency

1. Logout → login as citizen
2. Open **My Complaints** → verify **IN_PROGRESS**
3. Show notification. Say: *"The citizen immediately sees the authority's database-backed update."*

### 4:00 — Resolution

Authority sets **RESOLVED**. Citizen refreshes → verify **RESOLVED**.

### 4:30 — Intelligence

Authority → **Analytics**. Demonstrate: Complaint Trends, Department Performance, Categories, SLA Compliance, Regional Hotspots, Root Cause Intelligence, Future Complaint Forecast, AI Governance Recommendations, Policy Impact.

Every metric comes from backend/MongoDB APIs — not hardcoded dashboard values.

### 5:00 — Closing

*"GRACE AI connects citizens, AI-assisted analysis, and authorities through a persistent database-backed grievance lifecycle."*

---

## Hackathon Talking Points (Judge Q&A)

**Q: What is actually AI?**  
A: The current MVP uses a deterministic rule-based AI inference layer for classification, routing, duplicate probability, SLA risk, and recommendations. Its service interface is modular so a BERT/DistilBERT or other NLP model can replace the inference engine later without changing the core grievance workflow.

**Q: Is this real MongoDB?**  
A: Yes. Grievances, AI analysis, SLA predictions, status history, notifications, and analytics data are persisted in MongoDB through Mongoose.

**Q: Is the login real?**  
A: Yes. Users are seeded into MongoDB, passwords are bcrypt-hashed, and authentication uses JWT.

**Q: Can the citizen and authority see the same complaint?**  
A: Yes. Both roles retrieve the same grievance through backend APIs from MongoDB.

**Q: Are analytics hardcoded?**  
A: No. The dashboard uses MongoDB aggregation and database-derived records.

**Q: Is the forecasting model production ML?**  
A: No. The current forecast is explicitly a prototype statistical forecast. A trained forecasting model can replace it later.

**Q: Can this scale?**  
A: The MVP separates frontend, REST API, service layer, AI layer, and database. The AI service can later be replaced with production NLP/ML infrastructure, and asynchronous processing can be added if scale requires it.

---

## Limitations

- Rule-based AI demo engine — not trained BERT/ML models
- Prototype statistical forecast — not production time-series ML
- Policy impact records are seeded demonstration data
- Hackathon demonstration platform — not an official government service
- Requires MongoDB Atlas and cloud hosting credentials for live deployment

---

## Optional — Docker

```bash
docker compose up --build
```

MongoDB is **not** containerized — use MongoDB Atlas.

---

## Troubleshooting

### MongoDB connection failure

- Verify `MONGODB_URI` format and database name
- Check database user credentials
- Confirm Atlas **Network Access** allows your IP or backend host
- Ensure password special characters are URL-encoded

### Frontend cannot reach backend

- Verify `VITE_API_URL` in `frontend/.env` (local) or Vercel settings (production)
- Confirm backend is running and `/api/health` responds
- Check `CLIENT_URL` matches frontend origin for CORS

### Login fails

- Run `npm run seed` to create demo users
- Verify email/password (`Demo@1234` for demo accounts)

### Analytics empty

- Run `npm run seed`
- Confirm grievance records exist in MongoDB

### Vercel route 404 on refresh

- Verify `frontend/vercel.json` SPA rewrite configuration
- Ensure Vercel root directory is set to `frontend`

### Backend fails to start in production

- Ensure `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL` are all set
- Use a strong, unique `JWT_SECRET` (not the development default)

---

## GitHub

### Repository setup

1. Create a new repository on GitHub named `grace-ai` (Public recommended).
2. Description: *AI-powered grievance redressal and SLA enforcement platform built with React, Node.js, Express and MongoDB.*
3. Do **not** initialize with README (this repo already has one).

### Push commands

Replace `USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/USERNAME/grace-ai.git
git branch -M main
git push -u origin main
```

### Before pushing — security checklist

- [ ] `.env` is **not** tracked (only `.env.example` with empty placeholders)
- [ ] No real `MONGODB_URI`, `JWT_SECRET`, or API keys in any file
- [ ] `node_modules/` and `dist/` are ignored

---

## License

MIT — Hackathon demonstration project.

---

**GRACE AI** — AI-Powered Grievance Redressal & SLA Enforcement Platform

*Working Hackathon MVP — Not a Production Government System*
