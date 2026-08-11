# GRACE AI — Hackathon Submission Package

> **One-liner:** GRACE AI transforms citizen grievances into intelligent, trackable and data-driven governance actions.

> **GitHub description (≤160 chars):** AI-powered grievance platform with rule-based classification, SLA prediction, MongoDB persistence, citizen tracking & governance analytics. Hackathon MVP.

---

## 1. Project Summary

| Field | Value |
|-------|-------|
| **Project** | GRACE AI |
| **Full Name** | AI-Powered Grievance Redressal & SLA Enforcement Platform |
| **Tagline** | Smart Grievance Resolution. Transparent Governance. |
| **Theme** | AI for Smart Governance & Citizen Empowerment |

### Problem

Government grievance systems often suffer from manual classification, incorrect department routing, duplicate complaints, delayed resolution, and limited transparency for citizens.

### Solution

GRACE AI combines AI-assisted grievance classification, smart routing, duplicate detection, SLA prediction, citizen tracking, and database-driven governance analytics — all persisted in MongoDB Atlas through a shared citizen ↔ authority workflow.

---

## 2. Hackathon Abstract

Government grievance redressal systems frequently rely on manual triage, leading to misrouted complaints, duplicate records, SLA breaches, and poor citizen visibility. **GRACE AI** addresses this with a full-stack GovTech MVP that connects citizens and municipal authorities through a persistent, database-backed workflow.

Citizens submit complaints via a React + TypeScript portal. A modular rule-based AI inference layer (designed for future NLP/ML replacement) classifies complaints, routes them to departments, estimates duplicate probability, and predicts SLA risk. Grievances, AI analyses, SLA predictions, status histories, and notifications are stored in **MongoDB Atlas** via Mongoose. Authorities use a command center to search grievances, assign officers, update statuses, and monitor duplicates and SLA exposure. Analytics dashboards use MongoDB aggregations for trends, department performance, hotspots, root-cause intelligence, and governance recommendations.

The platform uses **JWT authentication**, bcrypt password hashing, and role-based access control. This is a **hackathon demonstration platform** — not an official government service — and does not claim production ML accuracy. The architecture separates frontend, REST API, service layer, AI layer, and database so trained models (e.g. BERT, embedding-based duplicate detection, ML SLA prediction) can be integrated without rewriting the core workflow.

**Expected impact:** faster routing, reduced duplicate work, SLA visibility, transparent citizen tracking, and evidence-based governance analytics.

---

## 3. Key Innovation Points

1. **AI-assisted complaint classification** — Automatic category and priority inference from complaint text using a modular rule-based demo engine.
2. **Smart department routing** — Categories map to departments; AI analysis recommends the correct municipal division at submission time.
3. **Duplicate complaint detection** — Heuristic similarity scoring flags potential duplicates with confidence and cluster management for authorities.
4. **SLA risk prediction** — Deadline tracking with risk levels (LOW / MEDIUM / HIGH / CRITICAL) and proactive at-risk alerts.
5. **Citizen transparency** — Real-time tracking, status timeline, and notifications when authorities update grievances.
6. **Authority command center** — Search, filter, assign officers, update status, and manage duplicates from one dashboard.
7. **Database-driven governance analytics** — MongoDB aggregation powers trends, SLA compliance, hotspots, and department rankings — not hardcoded charts.
8. **Proactive issue intelligence** — Root-cause rules, prototype forecasting, and AI governance recommendations surface patterns before they escalate.

---

## 4. Technical Architecture

```
React + TypeScript (Vite)
        ↓
   HTTPS REST API
        ↓
Node.js + Express
        ↓
   Service Layer
        ↓
 AI Analysis Layer
        ↓
     Mongoose
        ↓
  MongoDB Atlas
```

| Layer | Responsibility |
|-------|----------------|
| **React + TypeScript** | Citizen and authority portals, forms, tracking, analytics UI, JWT session in browser |
| **REST API** | HTTP endpoints for auth, grievances, AI, analytics, notifications; Zod validation |
| **Node.js + Express** | Routing, middleware (auth, CORS, rate limiting, Helmet), error handling |
| **Service Layer** | Business logic: grievance CRUD, status updates, assignments, notifications, analytics aggregations |
| **AI Analysis Layer** | Modular rule-based services: classification, routing, duplicate probability, SLA risk, recommendations |
| **Mongoose** | Schema validation, ObjectId references, transactions, aggregation pipelines |
| **MongoDB Atlas** | Persistent storage for all application data |

The frontend **never** connects directly to MongoDB.

---

## 5. AI Architecture

### Current MVP — Rule-Based Demo AI

| Function | Implementation |
|----------|----------------|
| Classification | Keyword/pattern rules on title + description |
| Department routing | Category → default department mapping + AI recommendation |
| Priority inference | Rule-based priority from keywords and category |
| Duplicate probability | Heuristic text/location/category similarity |
| SLA risk | Time-based rules from priority and elapsed time |
| Recommendations | Governance recommendation rules from analytics patterns |

**Analysis method tag:** `RULE_BASED_DEMO`

The current MVP **does NOT** use a trained BERT, DistilBERT, or production ML model. UI labels this as **AI Method: Rule-Based Demo**.

### Future Replacement Path

| Capability | Future approach |
|------------|-----------------|
| Classification | BERT / DistilBERT NLP classifiers |
| Duplicate detection | Embedding-based semantic similarity |
| SLA prediction | ML regression on historical resolution data |
| Forecasting | Trained time-series models |
| Recommendations | ML-driven policy suggestions |

The AI service interface is modular — swap inference engines without changing grievance workflow or MongoDB models.

---

## 6. Database Architecture

| Collection | Purpose | Key References |
|------------|---------|----------------|
| `User` | Citizens, authorities, officers, admins | — |
| `CitizenProfile` | Citizen address/ward preferences | `userId` → User |
| `Department` | Municipal departments | — |
| `Officer` | Field officers | `userId` → User, `departmentId` → Department, `wardId` → Ward |
| `ComplaintCategory` | Complaint categories | `defaultDepartmentId` → Department |
| `Ward` | City wards/zones | — |
| `Grievance` | Complaint records | `citizenId` → User, `categoryId`, `departmentId`, `wardId`, `assignedOfficerId` |
| `GrievanceStatusHistory` | Status transition audit trail | `grievanceId` → Grievance, `changedBy` → User |
| `AIAnalysis` | Rule-based analysis results | `grievanceId` → Grievance |
| `DuplicateMatch` | Duplicate clusters | `grievanceId`, `matchedGrievanceId` → Grievance |
| `SLAPrediction` | SLA risk records | `grievanceId` → Grievance |
| `Notification` | User notifications | `userId` → User, optional `grievanceId` |
| `AnalyticsSnapshot` | Aggregated dashboard snapshot | — |
| `PolicyImpact` | Seeded policy impact demo records | — |
| `AIRecommendation` | Governance recommendations | — |

All cross-entity links use MongoDB `ObjectId` references via Mongoose.

---

## 7. End-to-End Data Flow

```
Citizen
  ↓ Submit grievance (title, description, category, ward, location)
REST API  POST /api/grievances
  ↓
AI analysis  POST /api/ai/analyze-grievance (preview before submit)
  ↓
Category + Department + Priority inferred
  ↓
Duplicate detection  (similarity vs existing grievances)
  ↓
SLA prediction  (deadline, risk level, remaining hours)
  ↓
MongoDB  Grievance + AIAnalysis + SLAPrediction + DuplicateMatch + StatusHistory + Notification
  ↓
Authority dashboard  GET /api/grievances (search, filter)
  ↓
Officer assignment  PATCH /api/grievances/:id/assign
  ↓
Status update  PATCH /api/grievances/:id/status
  ↓
Status history  GrievanceStatusHistory document created
  ↓
Notification  citizen notified of status change
  ↓
Citizen tracking  GET /api/grievances/:id/timeline
```

---

## 8. Judge Demo Script (5 Minutes)

### 0:00–0:30 — Problem

*"Government grievance systems often rely on manual classification. Complaints get misrouted, duplicated, and citizens have no visibility into resolution. That's the problem GRACE AI solves."*

### 0:30–1:00 — GRACE AI Introduction

*"GRACE AI is an AI-powered grievance redressal platform. It classifies complaints, routes them to the right department, detects duplicates, predicts SLA risk, and gives both citizens and authorities a shared view — all backed by MongoDB."*

### 1:00–2:00 — Citizen Grievance Submission

*"I'll log in as a demo citizen."* → Click **Enter Citizen Demo**  
*"I'll register a pothole complaint near a school entrance."*  
Fill title, description, Road Infrastructure category, ward, location.  
*"Before submitting, I run GRACE AI analysis."*

### 2:00–2:30 — AI Analysis + MongoDB Persistence

*"The system returns category, department, priority, duplicate probability, SLA risk, and a recommendation. This uses our rule-based demo AI — designed so BERT can replace it later."*  
Submit → show `GRV-2026-XXXX`.  
*"The grievance is now persisted in MongoDB with AI analysis and SLA prediction records."*

### 2:30–3:30 — Authority Workflow

Logout → **Enter Authority Demo**.  
*"I'll search for the exact same grievance ID."*  
Open detail → show AI analysis, SLA, duplicates, timeline.  
*"This is the same record from the database — not a mock."*  
Assign Roads Officer → set status **IN_PROGRESS**.

### 3:30–4:00 — Citizen Status Update

Logout → login as citizen.  
*"The citizen immediately sees IN_PROGRESS and receives a notification."*  
Open My Complaints → verify status.

### 4:00–4:40 — Analytics and Intelligence

Authority → **Analytics**.  
*"Every metric comes from MongoDB aggregations — trends, SLA compliance, hotspots, root causes, prototype forecast, and governance recommendations."*

### 4:40–5:00 — Future Vision and Closing

*"GRACE AI connects citizens, AI-assisted analysis, and authorities through a persistent grievance lifecycle. The AI layer is modular — ready for production NLP and ML — while the core workflow already works end to end. Thank you."*

---

## 9. Live Demo Checklist

- [ ] Frontend running
- [ ] Backend running
- [ ] MongoDB connected
- [ ] Seed completed
- [ ] Citizen login works
- [ ] Authority login works
- [ ] AI analysis works
- [ ] Grievance creation works
- [ ] Grievance ID generated
- [ ] Tracking works
- [ ] Authority sees same grievance
- [ ] Officer assignment works
- [ ] Status update works
- [ ] Notification works
- [ ] Citizen sees updated status
- [ ] Resolution works
- [ ] Analytics works

---

## 10. Demo Data

**Demo credentials only — not for production use.**

| Role | Email | Password |
|------|-------|----------|
| Citizen | `citizen@grace.demo` | `Demo@1234` |
| Authority | `authority@grace.demo` | `Demo@1234` |
| Roads Officer | `roads.officer@grace.demo` | `Demo@1234` |
| Water Officer | `water.officer@grace.demo` | `Demo@1234` |
| Sanitation Officer | `sanitation.officer@grace.demo` | `Demo@1234` |

Seed creates 55 grievances, 8 departments, 9 categories, 6 wards, and full AI/SLA/duplicate/history/notification data.

---

## 11. Judge Questions — Quick Answers

**Why MongoDB?**  
Flexible document model fits grievances with nested AI analysis, status history, and analytics aggregations. Atlas provides managed cloud hosting for hackathon and production paths.

**Why Node.js?**  
Single language (TypeScript) across frontend and backend, fast REST API development, large ecosystem, easy deployment on Render/Railway.

**Why React?**  
Component-based UI for citizen and authority portals, strong TypeScript support, Vite for fast builds, ecosystem for charts and routing.

**What is AI here?**  
A modular rule-based inference layer for classification, routing, duplicate probability, SLA risk, and recommendations. Labeled **Rule-Based Demo** in the UI.

**Is BERT currently implemented?**  
**No.** The MVP uses deterministic rules. The architecture supports swapping in BERT/DistilBERT later.

**How does duplicate detection work?**  
Heuristic similarity on title, description, location, category, and ward against existing open grievances. Scores above threshold create `DuplicateMatch` records.

**How is SLA risk calculated?**  
Rules based on priority, time elapsed vs SLA deadline, and grievance status. Returns risk level, percentage, remaining hours, and recommendation.

**How is authentication secured?**  
bcrypt password hashing, JWT bearer tokens, role-based route authorization, rate-limited login, CORS restricted to `CLIENT_URL`.

**How do citizen and authority share data?**  
Both read/write the same `Grievance` documents in MongoDB through scoped REST APIs. Citizens see only their grievances; authorities see all.

**How are analytics generated?**  
MongoDB aggregation pipelines (`$match`, `$group`, `$lookup`, `$facet`) on grievance, SLA, and related collections. No hardcoded dashboard numbers.

**How can the platform scale?**  
Separate frontend, API, AI service, and database layers. AI can move to async workers/ML services; database can shard; API can horizontally scale.

**How can this become a real ML system?**  
Replace rule-based AI services with trained classifiers, embedding duplicate detection, ML SLA models, and time-series forecasting — same API contracts and MongoDB models.

**How can this be deployed?**  
Frontend on Vercel (`VITE_API_URL`), backend on Render/Railway (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`), database on MongoDB Atlas. See README Deployment section.

---

## 12. Limitations

- Current AI uses **deterministic rules** — not trained NLP/ML models.
- Forecasting is a **prototype statistical method** (`MOVING_AVERAGE_DEMO`) — not production time-series ML.
- Policy impact data is **seeded demonstration data** — not real government policy outcomes.
- **No real government integration** exists.
- **No real-world ML accuracy claim** is made. "AI Confidence" in the UI is demo inference output.
- GRACE AI is a **hackathon demonstration platform** — not an official government service.

---

## 13. Future Roadmap

| Phase | Goal |
|-------|------|
| **Phase 1** | Working hackathon MVP *(current)* |
| **Phase 2** | BERT/DistilBERT text classification |
| **Phase 3** | Embedding-based duplicate detection |
| **Phase 4** | ML-based SLA prediction |
| **Phase 5** | Real-time event processing (queues, webhooks) |
| **Phase 6** | Advanced forecasting models |
| **Phase 7** | Government system integrations (CRM, GIS, SMS gateways) |
| **Phase 8** | Scalable multi-region deployment |

---

## 14. Impact

### Citizens
- Easier complaint submission with guided AI analysis
- Transparent tracking with real-time status and timeline
- Faster updates via notifications when authorities act

### Authorities
- Better routing — complaints reach the correct department automatically
- SLA monitoring with at-risk alerts before deadlines breach
- Duplicate reduction through cluster detection and management
- Workload visibility via command center and officer assignment

### Governance
- Hotspot identification by ward and category
- Root cause analysis from aggregated complaint patterns
- Preventive action through forecast and recommendation insights
- Evidence-based decisions from MongoDB-derived analytics

---

## 15. Presentation Slides (10-Slide Outline)

### Slide 1 — GRACE AI
- AI-Powered Grievance Redressal & SLA Enforcement Platform
- Smart Grievance Resolution. Transparent Governance.
- Theme: AI for Smart Governance & Citizen Empowerment

### Slide 2 — Problem
- Manual classification and misrouting
- Duplicate complaints
- SLA breaches
- No citizen visibility

### Slide 3 — Our Solution
- AI-assisted classification and routing
- Duplicate detection + SLA prediction
- Shared MongoDB-backed citizen ↔ authority workflow
- Governance analytics dashboard

### Slide 4 — How GRACE AI Works
- Citizen submits → AI analyzes → MongoDB persists
- Authority assigns → updates status → citizen notified
- Analytics from live database

### Slide 5 — AI Intelligence
- Rule-Based Demo AI (current)
- Classification · Routing · Duplicate probability · SLA risk
- Modular path to BERT / ML (future)
- UI labeled honestly — no false ML claims

### Slide 6 — System Architecture
- React → REST API → Express → Service Layer → AI Layer → Mongoose → MongoDB Atlas
- JWT auth · Role-based access · No direct DB from frontend

### Slide 7 — Citizen + Authority Workflow
- Side-by-side: citizen creates GRV-2026-XXXX
- Authority searches same ID, assigns officer, sets IN_PROGRESS
- Citizen sees update immediately

### Slide 8 — Analytics & Governance Intelligence
- Trends · Departments · SLA · Hotspots
- Root causes · Forecast · Recommendations · Policy impact
- All from MongoDB aggregations

### Slide 9 — Technology + Future Scalability
- React · TypeScript · Node.js · Express · MongoDB · Mongoose
- Deploy: Vercel + Render + Atlas
- Roadmap: NLP · ML SLA · Real-time · Multi-region

### Slide 10 — Impact + Demo
- Citizens: transparency and faster updates
- Authorities: routing, SLA, duplicates
- Governance: data-driven decisions
- **Live demo:** Enter Citizen Demo → submit pothole → authority resolves

---

## Quick Reference

| Item | Command / Value |
|------|-----------------|
| Install | `npm run install:all` |
| Seed | `npm run seed` |
| Dev (both) | `npm run dev` |
| Backend only | `npm run dev:backend` |
| Frontend only | `npm run dev:frontend` |
| Build | `npm run build` |
| Health | `GET /api/health` |

See [README.md](./README.md) for full setup, deployment, and troubleshooting.
