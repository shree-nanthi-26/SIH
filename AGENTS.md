# SkillVista — Project Reference

## Project Brief

**SkillVista** is an AI-powered competency assessment and personalized learning
platform built for India's Official Statistical System. It is designed for
Smart India Hackathon 2026 and targets integration with the
**iGOT Karmayogi** ecosystem.

### Core Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Skill-Gap Analysis** | Compare an officer's current skills against a role-required skill set; rank and prioritize gaps. |
| 2 | **Personalized Learning Paths** | Recommend learning resources (courses, modules) targeting the highest-priority gaps. |
| 3 | **AI-Generated MCQ Quizzes** | Upload learning materials (PDF / PPT / DOCX) → Gemini LLM extracts content and generates multiple-choice questions with explanations. |
| 4 | **Competency Tracking Dashboard** | Continuous tracking for individual officers and aggregate views for administrators. |
| 5 | **iGOT Mock Adapter** | Documented mock adapter simulating iGOT Karmayogi's course-catalog and completion-record APIs (no production access required). |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 20 LTS |
| **Backend** | Express 4, Mongoose 8, MongoDB Atlas (or local) |
| **Frontend** | React 18, React Router 6, Redux Toolkit, Material UI 5 |
| **AI / LLM** | Google Gemini API (embeddings + generative), LangChain.js (optional orchestration) |
| **File Parsing** | `pdf-parse`, `mammoth` (DOCX), `pptx-parser` |
| **Auth** | JWT (access + refresh tokens) |
| **Testing** | Jest, Supertest, React Testing Library |
| **DevOps** | Docker, Docker Compose, GitHub Actions CI |

---

## Coding Style & Conventions

### General

- **Language**: JavaScript (ES2022+). TypeScript is optional but encouraged.
- **Async I/O**: All database and network calls use `async / await`. No raw
  callbacks or bare `.then()` chains.
- **Linting**: ESLint (Airbnb base) + Prettier (2-space indent, single quotes,
  trailing commas).
- **Documentation**: JSDoc on every exported function. OpenAPI 3.1 spec for all
  REST endpoints.

### RESTful API Conventions

- Resource-oriented URLs — plural nouns (`/api/v1/officers`, `/api/v1/quizzes`).
- Standard HTTP verbs: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- Consistent JSON envelope: `{ success, data, error, meta }`.
- Meaningful status codes: `200`, `201`, `400`, `401`, `403`, `404`, `500`.
- Pagination via `?page=&limit=` query params; responses include `meta.total`,
  `meta.page`, `meta.pages`.

### Folder Structure

```
/project
├── backend/
│   ├── src/
│   │   ├── config/          # env, db, constants
│   │   ├── middleware/       # auth, error-handler, validators
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routers (one per resource)
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   └── utils/            # Helpers (pagination, hashing, etc.)
│   ├── tests/
│   └── package.json
│
├── ai-modules/
│   ├── src/
│   │   ├── parsers/          # PDF, DOCX, PPT extraction
│   │   ├── embeddings.js     # Gemini embedding calls
│   │   ├── mcqGenerator.js   # MCQ generation pipeline
│   │   ├── skillMatcher.js   # Cosine-similarity gap analysis
│   │   └── utils/
│   ├── tests/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level page components
│   │   ├── services/         # Axios API wrappers
│   │   ├── store/            # Redux Toolkit slices
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/
│   ├── public/
│   ├── tests/
│   └── package.json
│
├── docker-compose.yml
├── AGENTS.md                 # ← this file
└── README.md
```

### Git & Branching

- Branch naming: `feat/<feature>`, `fix/<issue>`, `chore/<task>`.
- Commit messages: Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`).
- PRs require at least one review before merge.

---

*This document is the single source of truth for project conventions.
Update it whenever a decision changes.*
