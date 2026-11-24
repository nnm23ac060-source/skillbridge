# SkillBridge — Internship & Skill Development Platform

A complete **MERN** full-stack web application that helps students discover internships, apply to opportunities, manage their profiles and track applications — while admins publish listings and move candidates through the hiring pipeline.

> Built for an engineering internship demonstration: real REST APIs, real MongoDB collections, real JWT auth — **no fake functionality, no hardcoded dashboard numbers**.

---

## ✨ Features

### Student
| Area | What works |
|---|---|
| Authentication | Register / login / logout, JWT sessions, bcrypt hashing, protected + role-based routes |
| Dashboard | Live counts (internships available, applications submitted, pending, accepted), application status summary, recently posted internships, profile strength, getting-started checklist |
| Explorer | Search (title/company/skill/description), filters: location, category, skill, stipend bracket, work mode, sorting, pagination |
| Details | Full listing, skills, deadline countdown, apply flow |
| Apply | Cover letter + resume link, duplicate prevention (409), deadline guard, confirmation |
| Tracking | Five statuses (Pending → Under Review → Shortlisted → Accepted / Rejected), status tabs + search |
| Profile | Name, email, education entries, skills chips, GitHub / LinkedIn / portfolio / resume links, profile completeness % |

### Admin
| Area | What works |
|---|---|
| Dashboard | Live aggregates: students, internships, applications, pending, last-24h, status distribution, top internships, recent applications |
| Internship management | Create / edit / delete (with cascade warning), search, category & mode filters, pagination |
| Applicant management | All applications, status tabs with counts, search by student/email/internship, filter by internship, applicant profile + cover-letter viewer, one-click Reject / Shortlist / Accept |

---

## 🛠 Tech stack (strictly MERN)

- **MongoDB** + **Mongoose** — data modeling, validation, indexes, aggregations
- **Express.js** — REST API, middleware, rate limiting, helmet, central error handling
- **Node.js** — runtime
- **React 18 (Vite)** — SPA with React Router v6
- **Tailwind CSS** — design system (custom `brand` palette, soft shadows, animations)
- **JWT + bcrypt** — stateless auth, password hashing (cost 12)
- **Axios** — API client with token interceptor + session-expiry handling
- **Lucide React** — icons (brand marks as inline SVG)
- **React Hot Toast** — notifications

---

## 📁 Folder structure

```
skillbridge/
├── package.json              # root scripts (concurrently: dev, build, seed…)
├── README.md
├── client/                   # React + Vite
│   ├── index.html
│   ├── vite.config.js        # dev proxy /api → :5000, host 0.0.0.0
│   ├── tailwind.config.js    # brand palette, shadows, animations
│   └── src/
│       ├── api/client.js     # axios instance + interceptors
│       ├── context/AuthContext.jsx
│       ├── components/
│       │   ├── ui/           # Button, Input, Textarea, Select, Modal, Badge,
│       │   │                 # Card, StatCard, Spinner, State (empty/error)
│       │   ├── layout/       # DashboardLayout, Sidebar, Topbar
│       │   └── ProtectedRoute.jsx   # auth + role guards
│       ├── pages/
│       │   ├── Landing.jsx, NotFound.jsx
│       │   ├── auth/         # Login, Register, AuthLayout
│       │   ├── student/      # Dashboard, Internships, InternshipDetails,
│       │   │                 # ApplyModal, MyApplications, Profile
│       │   └── admin/        # Dashboard, ManageInternships, Applicants,
│       │                     # InternshipFormModal
│       └── utils/format.js
└── server/                   # Express API
    ├── .env / .env.example
    └── src/
        ├── server.js         # boot: connect DB → listen
        ├── app.js            # middleware, routes, SPA fallback (prod)
        ├── config/db.js
        ├── models/           # User, Internship, Application
        ├── controllers/      # auth, profile, internship, application
        ├── routes/           # auth, profile, internship, application
        ├── middleware/       # protect, authorize, validate, errors
        ├── utils/            # validators, generateToken, asyncHandler
        └── seed/seed.js      # admin + sample listings (idempotent)
```

---

## 🚀 Getting started

**Prerequisites:** Node 18+, MongoDB 6+ running locally (or a MongoDB Atlas URI).

```bash
# 1. Install dependencies
cd skillbridge
npm install
npm install --prefix server
npm install --prefix client

# 2. Configure environment
cp server/.env.example server/.env
#    → set MONGODB_URI and a strong JWT_SECRET

# 3. Seed admin + sample internships (clearly marked demonstration data)
npm run seed

# 4. Run both apps in development (Vite :5173 + API :5000, proxied)
npm run dev
```

Open **http://localhost:5173**

### Demo credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@skillbridge.dev` | `Admin@123` |
| Student | register any account (or run your own) | — |

> Sample internship listings created by `npm run seed` are **demonstration data** — every one can be edited/deleted from the admin panel.

### Other scripts

```bash
npm run server     # API only (nodemon)
npm run client     # Vite only
npm run seed       # idempotent seed (admin + samples)
npm run build      # production build of the client
npm start --prefix server   # API in production mode (serves client/dist too)
```

---

## 🔌 API reference

Base URL: `/api` — all responses `{ success, message?, data? | errors? }`.
Protected routes expect `Authorization: Bearer <token>`.

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Create student account (role forced `student`) |
| POST | `/auth/login` | public | Returns `{ user, token }` |
| GET | `/auth/me` | auth | Current user from token |

### Profile
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/profile/me` | auth | Full profile + completeness |
| PUT | `/profile/me` | auth | Update name/email/education/skills/links/resume |

### Internships
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/internships` | public | `q, location, category, skill, mode, minStipend, maxStipend, sort, page, limit` |
| GET | `/internships/:id` | public | Detail |
| POST | `/internships` | admin | Create |
| PUT | `/internships/:id` | admin | Partial update |
| DELETE | `/internships/:id` | admin | Delete (cascades applications) |

### Applications
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/applications` | student | Apply (duplicate → 409, deadline guard, resume required) |
| GET | `/applications/my` | student | Own list + status summary (`status, internshipId, q`) |
| GET | `/applications/my/:id` | student | Own application detail |
| GET | `/applications` | admin | All applications (`status, internshipId, q, sort`) |
| PATCH | `/applications/:id/status` | admin | Set Pending/Under Review/Shortlisted/Accepted/Rejected |
| GET | `/applications/admin/stats` | admin | Live dashboard aggregates |

### Health
`GET /api/health` → `{ success, db: connected|disconnected }`

---

## 🔐 Security highlights

- bcrypt password hashing (12 rounds), passwords `select: false` + stripped in `toJSON`
- JWT with expiry (`7d`), verified per-request; generic login errors (no user enumeration)
- Role-based authorization middleware on every mutating route; public signup can't choose a role; role-escalation payloads ignored
- express-validator on every input; helmet security headers; rate limiting (global + stricter on `/auth`)
- Duplicate applications blocked at API **and** DB level (compound unique index)
- CORS allow-list; Vite dev proxy keeps everything same-origin in development

---

## ✅ Testing

End-to-end suite in `skillbridge/e2e` (Playwright + Chromium) — 50 checks across 4 files:

```bash
cd skillbridge/e2e
node test-modules-1-3.mjs   # auth, guards, explorer, detail, mobile drawer
node test-module-4.mjs      # apply flow, duplicates, live status propagation
node test-module-5.mjs      # profile CRUD + persistence + completeness
node test-module-6.mjs      # admin stats, CRUD, applicants pipeline, cross-role
```

---

## ☁️ Deployment (single-server)

1. **Database** — MongoDB Atlas free cluster → copy `MONGODB_URI`.
2. **Build** — `npm run build` (creates `client/dist`).
3. **Server** — deploy `server/` to Render/Railway/Fly with env vars:
   `NODE_ENV=production`, `PORT` (platform-provided), `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`.
   In production the API automatically serves `client/dist` with an SPA fallback — one deploy serves both.
4. **Alternative** — serve `client/dist` on Netlify/Vercel and point an `/api` rewrite (or `VITE_API_URL`) at the API; set `CLIENT_URL` for CORS.

---

## 🗄 Data model

```
User        name, email*, password, role(student|admin),
            education[{institution, degree, fieldOfStudy, startYear, endYear, grade}],
            skills[], linkedin, github, portfolio, resume, timestamps

Internship  title, company, description, category, skills[], location,
            workMode(Remote|On-site|Hybrid), stipend, duration, deadline,
            createdBy→User, timestamps

Application student→User, internship→Internship, coverLetter, resume,
            status(Pending|Under Review|Shortlisted|Accepted|Rejected),
            timestamps, unique(student+internship)
```

---

MIT © SkillBridge
