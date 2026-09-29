# 🇧🇩 BD Power Strikers Club (BDPSC)

<p align="center">
  <strong>A data-driven eFootball club management, competition analytics, player ranking, tournament, and digital media platform.</strong>
</p>

<p align="center">
  <a href="https://github.com/Asem758/bd-power-striker"><img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub Repository"></a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111827" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Express-API-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
</p>

---

## 🚀 Project Description

**BD Power Strikers Club (BDPSC)** is a full-featured, data-driven **eFootball competitive club management platform** built to bring an entire competitive organization into one structured digital system. It connects the public club experience with player intelligence, match operations, automated performance analytics, rankings, tournament management, trophies, digital player cards, media publishing, authentication, and permission-controlled administration.

The core idea is simple: **competitive activity becomes structured data, and structured data becomes actionable club intelligence.** Match results and player performances feed aggregate statistics; the statistics feed the rating engine; ratings drive power rankings; and the resulting competitive record is reflected consistently across player profiles, rankings, tournaments, awards, trophies, seasons, and digital cards.

BDPSC combines a modern **React 19 + TypeScript + Tailwind CSS 4** frontend with **Vite + Express**, a deterministic file-backed operational store, and **Supabase database/authentication integration**. This gives the project both a polished esports-facing presentation layer and a structured operations layer for managing the club behind the scenes.

### Product Vision

> **Turn a competitive eFootball club into a measurable digital organization where every player, match, tournament, performance, ranking, achievement, and media asset has a structured place in the system.**

### What the platform brings together

- 🏟️ Public eFootball club website
- 👤 Official player profiles and squad management
- 📊 Automated player statistics and rating calculations
- 🏆 Power rankings and form-based rankings
- ⚔️ Match center and fixture operations
- 🎮 Tournament management and knockout brackets
- 🥇 Trophy cabinet, awards, and milestones
- 🪪 Digital player-card generation
- 📰 Club news, announcements, and media library
- 🔎 Global player/content search
- 🔐 Authentication, protected routes, and role-based administration
- 👨‍💼 Dedicated player dashboard
- 🛡️ Super-admin role and permission management
- 🧾 Audit logging for important administrative actions
- ☁️ Supabase database synchronization and schema support

---

## ✨ Key Features

### 1. Public Club Website

The public experience focuses on the club rather than administration.

- Club overview and season performance
- Official squad
- Player profile pages
- Match results and upcoming fixtures
- Tournament center
- Power rankings
- Trophy cabinet
- News and media
- Search
- Digital player cards
- Club announcements
- Responsive esports-oriented visual design

The public navigation is intentionally separated from internal administration. Administrative tools are accessed through protected authenticated routes rather than being exposed as normal public navigation.

### 2. Player Management

Each BDPSC athlete can have a structured profile containing:

- Real name
- Gaming name
- eFootball ID
- Jersey number
- Position
- Club tier
- Status
- Join date
- Biography
- Preferred platform
- Playstyle
- Favorite team
- Social handle
- Photo/avatar
- Rating
- Overall/form/weekly/monthly/season rankings
- Matches, wins, draws, losses
- Win rate
- Goals
- Assists
- Clean sheets
- MOTM count
- Rating progression
- Career timeline
- Awards and trophies
- Match history

### 3. Automated Rating & Statistics Engine

BDPSC contains a dedicated server-side engine for recalculating player statistics, ratings, and rankings.

The rating configuration can account for competitive performance factors such as:

- Match result
- Goals
- Assists
- Clean sheets
- Player of the Match / MOTM
- Opponent strength
- Tournament importance
- Recent form

The platform also supports administrator-controlled rating configuration and manual rating/rank overrides through permission-protected operations.

### 4. Power Rankings

Ranking views include multiple competitive perspectives:

- Overall
- Form
- Weekly
- Monthly
- Season

Ranking tables surface competitive metrics such as:

- Matches played
- Wins
- Win percentage
- Goals
- Assists
- Clean sheets
- MOTM
- Form
- Overall rating
- Rank movement

### 5. Match Center & Fixtures

Match operations cover the competitive lifecycle:

- Completed matches
- Upcoming fixtures
- Opponent information
- Competition type
- Match scores
- MVP/MOTM
- Player performance statistics
- Match reports
- Stream/highlight links
- Fixture scheduling
- Fixture-to-match conversion

### 6. Tournament Management

The tournament module supports:

- Tournament records
- Editions
- Season association
- Tournament format
- Upcoming/ongoing/completed states
- Participant counts
- Champion and runner-up
- Bracket data
- Top scorer
- MVP
- Tournament-linked matches

The UI is designed to present tournament information and knockout progression in a dedicated competition center.

### 7. Trophy Cabinet, Awards & Milestones

BDPSC maintains a structured achievement layer for:

- Club trophies
- Championship victories
- Player awards
- MVP recognition
- Top-scorer recognition
- Club milestones
- Achievement descriptions
- Highlight statistics

### 8. Digital Player Cards

The platform includes a dedicated digital-card generator for transforming player data into shareable BDPSC-style player cards.

### 9. News, Announcements & Media

Content operations include:

- News articles
- Article status publishing
- Club announcements
- Media library
- Image uploads
- Match/tournament screenshots
- Player media
- Highlights and external media links
- Tags and descriptions

### 10. Authentication & Protected Areas

The application includes:

- Local email/password registration
- Email/password login
- Google-account authentication flow
- Logout
- Session handling
- Password reset flow
- Profile updates
- Password change
- Protected player dashboard
- Protected role-based admin dashboard
- Player-to-user account linking

### 11. Role-Based Access Control (RBAC)

The repository defines system roles including:

| Role | Purpose |
|---|---|
| **SUPER_ADMIN** | Full system authority, including users, roles, permissions, data, and settings |
| **ADMIN** | General club administration |
| **STATISTICS_MANAGER** | Match data, player performance, ratings, and rankings |
| **EDITOR** | News, announcements, and content publishing |
| **MEDIA_MANAGER** | Player/media assets, screenshots, highlights, and digital media |
| **PLAYER** | Private athlete dashboard and player-specific features |

The backend performs permission checks before protected administrative operations. Super Admin privileges can manage role assignments and role definitions.

### 12. Audit Logging

Important administrative actions are recorded with information such as:

- Actor
- Action
- Entity type
- Entity ID
- Previous value
- New value
- Reason
- Timestamp

This creates an operational history for sensitive club-management changes.

---

## 🧠 Core Data Flow

BDPSC is designed around a connected competitive-data pipeline:

```text
Match Data
    ↓
Player Match Performance
    ↓
Aggregated Player Statistics
    ↓
Rating Engine
    ↓
Power Rankings
    ↓
Player Profiles / Awards / Trophies / Digital Cards
```

This architecture helps prevent the public-facing statistics from becoming disconnected manual values.

For example:

```text
A match is recorded
        ↓
Player performance is attached
        ↓
Goals / assists / clean sheets / MOTM are aggregated
        ↓
Rating calculation runs
        ↓
Rankings are recalculated
        ↓
Player profile and ranking pages reflect the new data
```

---

## 🏗️ Architecture

BDPSC uses a hybrid application architecture:

```text
┌─────────────────────────────────────────────────────────────┐
│                    BDPSC PUBLIC WEBSITE                     │
│ React + TypeScript + Tailwind + Vite                        │
│ Home • Players • Matches • Rankings • Tournaments           │
│ Trophies • News • Media • Search • Digital Cards            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 AUTHENTICATED APPLICATION                   │
│ Login • Player Dashboard • Protected Admin Dashboard        │
│ RBAC • Sessions • Permissions • Audit Operations             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS API SERVER                        │
│ /api/* • Auth • Players • Matches • Tournaments • Rankings  │
│ Seasons • News • Media • Fixtures • Admin Operations         │
└───────────────┬──────────────────────────┬──────────────────┘
                │                          │
                ▼                          ▼
┌────────────────────────┐      ┌─────────────────────────────┐
│ File-backed DB Layer   │      │ Supabase Integration        │
│ data/bdpsc-store.json  │      │ Database + Auth + RLS       │
└────────────────────────┘      └─────────────────────────────┘
```

### Architectural principles

1. **Public and private experiences are separated.**
2. **Administrative operations are protected by authentication and permissions.**
3. **Competitive statistics are recalculated from structured match data.**
4. **The local operational data layer provides a deterministic development/runtime store.**
5. **Supabase provides cloud database/auth integration and a relational schema.**
6. **The API acts as the central boundary for application operations.**

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS 4 |
| API / Server | Express |
| Runtime tooling | Node.js + TSX / Bun lockfile |
| Database | File-backed JSON store + Supabase integration |
| Authentication | Local session authentication + Google/Supabase authentication flow |
| Cloud Database | Supabase |
| Icons | Lucide React |
| Animation | Motion |
| AI Integration | Google GenAI SDK |
| Bundling | esbuild |
| Configuration | dotenv |

---

## 📁 Project Structure

```text
bd-power-striker/
├── data/
│   └── bdpsc-store.json
│
├── public/
│   ├── assets/
│   ├── opponent-logos/
│   ├── uploads/
│   ├── bdpsc-crest.svg
│   └── logo.svg
│
├── server/
│   ├── app.ts
│   ├── authUtils.ts
│   ├── db.ts
│   ├── engine.ts
│   ├── initialData.ts
│   ├── routes.ts
│   ├── supabase.ts
│   └── supabaseSync.ts
│
├── src/
│   ├── components/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── HomeView.tsx
│   │   ├── PlayersView.tsx
│   │   ├── RankingsView.tsx
│   │   ├── MatchesView.tsx
│   │   ├── TournamentsView.tsx
│   │   ├── TrophiesView.tsx
│   │   ├── NewsMediaView.tsx
│   │   └── DigitalCardGenerator.tsx
│   ├── context/
│   ├── services/
│   ├── utils/
│   ├── App.tsx
│   ├── types.ts
│   └── main.tsx
│
├── supabase/
│   └── schema.sql
│
├── docs/
│   └── screenshots/
│
├── .env.example
├── package.json
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 🖼️ Screenshots / Preview

The following six **BDPSC UI reference screenshots supplied for this project** are represented in the repository under `docs/screenshots/`. They are optimized lightweight SVG preview assets so the GitHub README loads quickly while preserving the intended page structure, visual hierarchy, and feature references.

> **Reference asset policy:** the README uses repository-hosted image files rather than temporary chat attachments, so the previews remain available directly from GitHub.

### 01 — Homepage / Club Overview

<img width="1920" height="4019" alt="fullpage_snapshot_bd-power-strikers_ai_studio_2026-09-29-16-38-22" src="https://github.com/user-attachments/assets/cc791100-f33e-450e-986d-d47eaa3cbc12" />
)

**Highlights:** club identity, season performance, latest result, upcoming clash, squad leaders, player recognition, dispatches, and trophy presentation.

### 02 — Official Squad / Player Management

<img width="1920" height="2135" alt="fullpage_snapshot_bd-power-strikers_ai_studio_2026-09-29-16-38-56" src="https://github.com/user-attachments/assets/d0a200b6-c314-4126-afbe-6ca0ca40d290" />



**Highlights:** player cards, OVR, positions, status, competitive statistics, search/filter experience, profile access, and digital-card access.

### 03 — News & Media

<img width="1920" height="1538" alt="fullpage_snapshot_bd-power-strikers_ai_studio_2026-09-29-16-39-57" src="https://github.com/user-attachments/assets/20c8dbe5-cc04-4295-a668-c553cfbcb711" />
<img width="1920" height="1538" alt="fullpage_snapshot_bd-power-strikers_ai_studio_2026-09-29-16-40-30" src="https://github.com/user-attachments/assets/52d91533-5dc3-41d9-979d-a6c87025ebcd" />



**Highlights:** press releases, official club dispatches, match reports, media coverage, announcements, and news archive.

### 04 — Match Center & Fixtures

<img width="1920" height="1708" alt="fullpage_snapshot_bd-power-strikers_ai_studio_2026-09-29-16-39-17" src="https://github.com/user-attachments/assets/39ed68e2-fdf1-44fc-b791-fe55542c9409" />


**Highlights:** completed results, upcoming fixtures, tournament filters, scores, MVP, match reports, and performance statistics.

### 05 — Trophy Cabinet & Club Honors

<img width="1920" height="1575" alt="fullpage_snapshot_bd-power-strikers_ai_studio_2026-09-29-16-40-13" src="https://github.com/user-attachments/assets/c6d3160c-ed46-485f-83eb-eca570d246a6" />


**Highlights:** championship trophies, individual honors, club milestones, tournament history, MVP recognition, and top-scorer achievements.

### 06 — Tournament Center & Brackets

<img width="1920" height="2095" alt="fullpage_snapshot_bd-power-strikers_ai_studio_2026-09-29-16-39-32" src="https://github.com/user-attachments/assets/c2d0eba0-f263-42eb-990b-5b1c571e5900" />


**Highlights:** tournament metadata, participants, MVP, top scorer, knockout progression, final, and champion presentation.

### 07 - Player Power Ranking

<img width="1920" height="1808" alt="fullpage_snapshot_bd-power-strikers_ai_studio_2026-09-29-16-39-45" src="https://github.com/user-attachments/assets/061556a6-9a45-4167-84d1-a07364dbea1a" />


**Highlights:** ranking modes, competitive metrics, form, win percentage, goals, assists, MOTM, and overall rating.

---

## ⚙️ Local Installation

### Prerequisites

Recommended:

- Node.js 20+
- Bun (recommended because the repository includes `bun.lock`)
- A Supabase project if cloud synchronization/authentication is required

### 1. Clone the repository

```bash
git clone https://github.com/Asem758/bd-power-striker.git
cd bd-power-striker
```

### 2. Install dependencies

Using Bun:

```bash
bun install
```

Or using npm:

```bash
npm install
```

### 3. Configure environment variables

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Configure the required values:

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000

VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Never commit private credentials, service-role keys, passwords, or other secrets.**

### 4. Start development mode

```bash
bun run dev
```

The Express/Vite development server runs on:

```text
http://localhost:3000
```

### 5. Type-check the project

```bash
bun run lint
```

### 6. Build for production

```bash
bun run build
```

### 7. Start production server

```bash
bun run start
```

---

## 🗄️ Supabase / Database Setup

The repository contains a relational Supabase schema at:

```text
supabase/schema.sql
```

The schema covers major entities including:

- `profiles`
- `players`
- `seasons`
- `tournaments`
- `matches`
- `match_performances`
- `trophies`
- `player_awards`
- `fixtures`
- `news_articles`
- `media_items`
- `announcements`
- `rating_configs`
- `audit_logs`

It also enables Row Level Security (RLS) and includes policies for public reads and administrator-controlled writes.

### Recommended setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Copy the contents of `supabase/schema.sql`.
4. Run the schema.
5. Configure the Supabase URL and anonymous key in `.env`.
6. Verify the application connection from the administrative database integration view.
7. Use the application's synchronization tools where appropriate.

### Important database architecture note

The current application also maintains a local operational state in:

```text
data/bdpsc-store.json
```

The server-side database manager loads or initializes this state and the repository includes Supabase synchronization support. This hybrid model is useful for development and controlled operation, while the Supabase schema provides the relational cloud data model for a more persistent deployment architecture.

---

## 🔌 API Documentation Overview

The API is mounted under:

```text
/api
```

### Health & cloud integration

```http
GET  /api/health
GET  /api/supabase/status
GET  /api/supabase/schema
POST /api/supabase/sync
```

### Public club data

```http
GET /api/club-stats

GET /api/players
GET /api/players/:idOrSlug

GET /api/matches
GET /api/matches/:id

GET /api/tournaments
GET /api/tournaments/:idOrSlug

GET /api/rankings

GET /api/seasons
GET /api/seasons/:id

GET /api/awards
GET /api/trophies

GET /api/news
GET /api/news/:slug

GET /api/announcements
GET /api/announcements/:id

GET /api/media

GET /api/fixtures
GET /api/fixtures/:id

GET /api/milestones
GET /api/search

GET /api/rating-config
```

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
POST /api/auth/logout

GET  /api/auth/me

POST /api/auth/forgot-password
POST /api/auth/reset-password

PUT /api/auth/update-profile
PUT /api/auth/change-password
POST /api/auth/avatar
```

### Player dashboard

```http
GET /api/player/me/stats
PUT /api/player/me/profile
```

### Protected administration

Examples of administrative operations include:

```http
POST   /api/admin/login

GET    /api/admin/users
PUT    /api/admin/users/:id/roles
PUT    /api/admin/users/:id/status
DELETE /api/admin/users/:id
PUT    /api/admin/users/:id/player-link

GET    /api/admin/roles
POST   /api/admin/roles
PUT    /api/admin/roles/:id
DELETE /api/admin/roles/:id

GET    /api/admin/permissions

GET    /api/admin/rating-config
PUT    /api/admin/rating-config

POST   /api/admin/recalculate-rankings
GET    /api/admin/audit-logs

POST   /api/admin/upload
POST   /api/admin/reset
```

Additional CRUD endpoints exist for players, matches, tournaments, seasons, awards, trophies, news, announcements, media, fixtures, and milestones.

### Authorization model

Protected endpoints use bearer-session authentication and permission middleware. The server checks:

```text
Authentication
      ↓
User
      ↓
Assigned Roles
      ↓
Resolved Permissions
      ↓
Endpoint Permission Check
      ↓
Allow / Deny
```

Super Admin access is explicitly handled separately for sensitive role-management operations.

---

## 🔐 Security Model

The repository includes several security-oriented mechanisms:

- Protected routes for player and administrator areas
- Server-side authentication checks
- Permission middleware
- Super Admin authorization
- Session tokens
- Secure random token generation
- PBKDF2 + SHA-512 password hashing
- Timing-safe password verification
- Password reset tokens
- User status checks for suspended accounts
- Audit logging
- Supabase Row Level Security
- Environment-based secrets
- Controlled upload endpoints
- Server-side API boundary

### Security hardening for production

Before exposing the platform to a public production environment, review and harden:

- Session/token lifecycle and expiration
- HTTPS enforcement
- CSRF strategy
- Rate limiting
- Upload MIME/type/size validation
- Content Security Policy
- Input validation and sanitization
- Supabase RLS policies
- Production secrets management
- Database backups
- Logging/monitoring
- Removal of development/testing authentication shortcuts

---

## 👨‍💼 Admin Operating Model

The platform separates three experiences:

### Public Website

```text
/
├── Players
├── Matches
├── Tournaments
├── Rankings
├── News
├── Media
└── Trophies
```

### Player Dashboard

```text
/dashboard
```

Authenticated players can access their private player-focused experience.

### Admin Dashboard

```text
/admin/dashboard
```

Administrative functionality is protected by authentication and role/permission checks.

The intended operational model is:

```text
Public Visitor
    │
    ├── Public club content
    │
    └── Sign In
          │
          ├── Player → /dashboard
          │
          └── Authorized Staff/Admin → /admin/dashboard
```

This keeps club administration out of the normal public browsing experience.

---

## 📈 Rating & Ranking Engine

The server includes a dedicated engine module:

```text
server/engine.ts
```

The engine is responsible for calculating player performance and recalculating aggregate statistics/rankings.

The repository also exposes an administrator-facing rating configuration model, allowing the competitive formula to evolve without redesigning the entire public UI.

Conceptually:

```text
Player Rating
= Base Rating
+ Match Result Impact
+ Goal Contribution
+ Assist Contribution
+ Defensive Contribution
+ MOTM Impact
+ Opponent Strength
+ Tournament Weight
+ Recent Form
```

The exact production formula should be treated as the authoritative implementation in `server/engine.ts` and its rating configuration rather than this README's conceptual representation.

---

## 🧩 Major Modules

| Module | Primary Responsibility |
|---|---|
| `HomeView` | Public club overview |
| `PlayersView` | Squad discovery and filtering |
| `PlayerProfileView` | Player career/statistics profile |
| `RankingsView` | Competitive power rankings |
| `MatchesView` | Results and fixtures |
| `TournamentsView` | Tournament information and brackets |
| `TrophiesView` | Club trophies and honors |
| `NewsMediaView` | News and media content |
| `DigitalCardGenerator` | Digital player cards |
| `PlayerDashboard` | Private player/member experience |
| `RoleAdminDashboard` | Role-based administration |
| `AuthContext` | Authentication state |
| `ProtectedRoute` | Protected route enforcement |
| `api.ts` | Frontend API integration |
| `authService.ts` | Frontend authentication operations |
| `db.ts` | Local operational persistence |
| `engine.ts` | Rating/statistics/ranking calculations |
| `routes.ts` | Express API and authorization boundary |
| `supabaseSync.ts` | Supabase synchronization |

---

## 🗺️ Roadmap

### Phase 1 — Core Platform
- [x] Public club website
- [x] Player profiles
- [x] Match center
- [x] Tournament center
- [x] Rankings
- [x] Trophy cabinet
- [x] News/media
- [x] Digital player cards

### Phase 2 — Data & Competition Operations
- [x] Match performance records
- [x] Rating calculation engine
- [x] Ranking recalculation
- [x] Season management
- [x] Fixture management
- [x] Audit logging
- [x] Admin rating configuration

### Phase 3 — Identity & Administration
- [x] User registration/login
- [x] Google authentication flow
- [x] Protected player dashboard
- [x] Protected admin dashboard
- [x] Role-based permissions
- [x] Super Admin role management
- [x] Player-account linking

### Phase 4 — Production Hardening
- [ ] Production-grade session lifecycle
- [ ] Centralized cloud-first persistence
- [ ] Automated database backups
- [ ] Rate limiting and abuse protection
- [ ] Automated API integration tests
- [ ] End-to-end browser tests
- [ ] CI/CD pipeline
- [ ] Observability and error tracking
- [ ] Production deployment documentation

### Phase 5 — Competitive Intelligence
- [ ] Advanced player trend analytics
- [ ] Head-to-head comparison
- [ ] Performance charts by season
- [ ] Opponent strength history
- [ ] Match prediction/analysis tools
- [ ] Expanded tournament statistics
- [ ] Automated match report generation
- [ ] Advanced club performance dashboards

---

## 🧪 Development Commands

```bash
# Install
bun install

# Development
bun run dev

# Type-check
bun run lint

# Production build
bun run build

# Production start
bun run start

# Clean build artifacts
bun run clean
```

---

## 🤝 Contributing

Contributions should preserve the platform's data integrity and separation between public content and privileged operations.

Recommended workflow:

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes.
4. Run type-checking.
5. Test public and protected flows.
6. Verify rating/ranking calculations when modifying match logic.
7. Confirm permissions for any new administrative endpoint.
8. Open a pull request with a clear technical description.

---

## 📌 Data Integrity Guidelines

When modifying BDPSC competition logic:

- Do not manually duplicate derived statistics when they can be recalculated.
- Treat match performance as a source for player aggregates.
- Recalculate rankings after material player/match changes.
- Keep rating configuration versioned.
- Protect administrative mutations with permission checks.
- Record sensitive administrative changes in audit logs.
- Keep public UI independent from privileged administration.
- Avoid exposing private user/session information through public APIs.

---

## 📄 License

No license file is currently documented in this repository. Until a license is added, the repository should be treated as **all rights reserved** by default.

If this project is intended to be open source, add an explicit license before accepting external reuse or redistribution.

---

## 🔗 Repository

**GitHub:**  
https://github.com/Asem758/bd-power-striker

**Project:**  
BD Power Strikers Club (BDPSC)

**Primary focus:**  
eFootball • Club Management • Player Analytics • Power Rankings • Tournament Operations • Digital Player Cards • Role-Based Administration

---

<p align="center">
  <strong>BD POWER STRIKERS CLUB</strong><br>
  <sub>Compete. Measure. Improve. Build the club beyond the match.</sub>
</p>
