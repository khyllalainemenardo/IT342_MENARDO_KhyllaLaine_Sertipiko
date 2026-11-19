# Sertipiko — Frontend (ReactJS + Vite)

Frontend for **Sertipiko: A Seminar Attendance and E-Certificate Management System**.
This module covers **User Accounts & Authentication**: registration, email/password
sign-in, logout, and role-based dashboards for Participant, Organizer, and Administrator.

## Run

```bash
cd frontend
cp .env.example .env      # adjust VITE_BACKEND_URL / VITE_SCHOOL_DOMAIN if needed
npm install
npm run dev               # http://localhost:5173
```

The Spring Boot backend must be running at `VITE_BACKEND_URL` (default `http://localhost:8080`).

## How authentication works

| Requirement | Implementation |
|---|---|
| Account creation | `/register` form → `POST /api/auth/register`. Always creates a **PARTICIPANT**; the form never sends a role. |
| Validate required fields | Full name, school email, department, password, confirm password — checked in the browser for instant feedback **and** again in Spring (`@Valid`). |
| Prevent duplicates | Backend checks the email (case-insensitive) and the DB has a UNIQUE constraint; returns `409` → "An account with this email already exists." |
| Hash passwords | Backend hashes with **BCrypt** (`BCryptPasswordEncoder`) before saving. The frontend never stores the password. |
| Assign roles | New accounts = `PARTICIPANT`. The admin grants/revokes `ORGANIZER` and disables accounts (FR-06). The first `ADMIN` is seeded on the backend. |
| Login + errors | `POST /api/auth/login`; `401` → "Invalid email or password." (same message whether email or password is wrong). `403` → disabled account. |
| Secure session | Spring Security creates an HttpOnly `JSESSIONID` cookie. Nothing about the user or role is kept in `localStorage`. |
| Logout | `POST /api/auth/logout` invalidates the server session; protected pages then redirect to `/login`. |
| RBAC | React guards every route by role (`ProtectedRoute`), and Spring must guard every `/api/**` endpoint the same way (FR-07). |

Password rules (front and back): 8–72 characters, with uppercase, lowercase, and a number.
Email must end with `@VITE_SCHOOL_DOMAIN` (backend: its own config value).

## Backend contract

All requests send cookies (`withCredentials`). If CSRF is enabled, use
`CookieCsrfTokenRepository.withHttpOnlyFalse()` — axios sends `X-XSRF-TOKEN` automatically.

### `POST /api/auth/register`
```json
{ "fullName": "Juan Dela Cruz", "email": "juan@cit.edu", "department": "CCS",
  "password": "Secret123", "confirmPassword": "Secret123" }
```
- `201` → created user (no password/hash in the response)
- `400` → `{ "message": "...", "errors": { "email": "...", "password": "..." } }` (field errors are shown under each input)
- `409` → email already registered

### `POST /api/auth/login`
`{ "email": "...", "password": "..." }` → `200` with the user (same shape as `/me`) and a
session cookie. `401` invalid credentials, `403` disabled account, `429` too many attempts (optional).

### `GET /api/auth/me`
`200` for a signed-in user, `401` otherwise.
```json
{
  "id": 12,
  "fullName": "Juan Dela Cruz",
  "email": "juan@cit.edu",
  "role": "PARTICIPANT",
  "department": "CCS",
  "qrToken": "random-url-safe-token",
  "enabled": true,
  "createdAt": "2026-11-19T10:00:00Z"
}
```
`role` is `PARTICIPANT` | `ORGANIZER` | `ADMIN` (`ROLE_` prefix also accepted).
`qrToken` is only returned to its owner (FR-05, FR-17). Never return `password`/`passwordHash`.

### `POST /api/auth/logout`
Invalidate the session, delete `JSESSIONID`, return `204`.

### Admin (ADMIN only — `403` for anyone else)
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/admin/users?search=&role=` | — | `User[]` (no `qrToken`) |
| PATCH | `/api/admin/users/{id}/role` | `{ "role": "ORGANIZER" }` | updated user |
| PATCH | `/api/admin/users/{id}/status` | `{ "enabled": false }` | updated user |

The backend should block an admin from changing their own role or status.

## Development proxy (Codespaces)

`vite.config.js` proxies `/api` to the backend so the browser only talks to one origin and
the session cookie stays first-party. No CORS setup is needed in dev.

## Routes

| Path | Access |
|---|---|
| `/login`, `/register`, `/unauthorized` | Public |
| `/` , `/dashboard` | Redirects to the signed-in user's dashboard |
| `/participant`, `/participant/qr`, `/participant/seminars`, `/participant/certificates` | PARTICIPANT |
| `/organizer`, `/organizer/seminars`, `/organizer/scanner`, `/organizer/reports` | ORGANIZER |
| `/admin`, `/admin/users`, `/admin/approvals`, `/admin/reports` | ADMIN |

Seminars, scanner, certificates, approvals, and reports are labelled placeholders for
later SRS features. They show no mock data.

## Structure

```
src/
  api/          client.js (axios + session/CSRF), authApi.js, adminApi.js
  auth/         AuthContext, useAuth, ProtectedRoute + RoleRedirect, roles (nav menus)
  components/   AppLayout (role-based nav + logout), FormField, ProfileCard, Avatar, Spinner, …
  utils/        validation.js (registration rules)
  pages/        LoginPage, RegisterPage, UnauthorizedPage, NotFoundPage
    participant/  ParticipantDashboard, MyQrPage
    organizer/    OrganizerDashboard
    admin/        AdminDashboard, UserManagementPage
```
