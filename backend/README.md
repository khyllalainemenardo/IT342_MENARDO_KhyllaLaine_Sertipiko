# Sertipiko — Backend (Spring Boot 3 + Supabase PostgreSQL)

User Accounts & Authentication module: registration, login/logout with a server session,
BCrypt password hashing, and role-based access control (PARTICIPANT, ORGANIZER, ADMIN).

## Requirements

- Java 17 or newer (`java -version`)
- A Supabase project (PostgreSQL)
- Maven wrapper files (`mvnw`, `mvnw.cmd`, `.mvn/`) — see step 3

## Setup

### 1. Create the table in Supabase
Supabase dashboard → **SQL Editor** → paste the contents of
`db/migration/V1__create_users.sql` → **Run**.

The script enables Row Level Security and revokes access from the `anon` and
`authenticated` roles, so the `users` table (with password hashes) cannot be read
through Supabase's public Data API. The backend connects as `postgres`, which is not
affected.

### 2. Configure `.env`
Copy `.env.example` to `.env` (Windows: `copy .env.example .env`) and fill in:

| Key | Where to find it |
|---|---|
| `DB_URL` | Supabase → **Connect** → **Session pooler** host. Format: `jdbc:postgresql://<host>:5432/postgres?sslmode=require` |
| `DB_USERNAME` | `postgres.<project-ref>` |
| `DB_PASSWORD` | Your database password |
| `SCHOOL_DOMAIN` | Accepted email domain, e.g. `cit.edu` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | First administrator, created on startup if no admin exists |

`.env` is gitignored. Never commit it.

### 3. Add the Maven wrapper (once)
Go to https://start.spring.io, keep **Maven** and **Java 17**, click **Generate**, unzip,
and copy only `mvnw`, `mvnw.cmd`, and the `.mvn` folder into this `backend` folder.
(Or run `mvn wrapper:wrapper` if Maven is installed.)

### 4. Run
```
cd backend
mvnw.cmd spring-boot:run        (Windows)
./mvnw spring-boot:run          (macOS/Linux)
```
The API starts on http://localhost:8080. Then start the frontend (`npm run dev` in
`frontend`) and open http://localhost:5173.

## Increment 2 — Profile, Forgot/Reset Password, Change Password

Run `db/migration/V2__profile_and_password_reset.sql` in the Supabase SQL Editor once
(adds `users.password_changed_at` and the `password_reset_tokens` table, RLS enabled).

| Requirement | Implementation |
|---|---|
| View/edit own profile | `GET/PUT /api/profile`. Always uses the signed-in user's ID from the session, never an ID from the request, so nobody can edit another user's profile. Editable: department/organization and user type. Name and email stay locked (FR-04). |
| Forgot password | `POST /api/auth/password/forgot`. Always returns the same message, so it never reveals whether an email is registered. Max 3 requests per email per 15 minutes. |
| Secure reset token | 256-bit random token, only its **SHA-256 hash** is stored; expires after `RESET_TOKEN_MINUTES` (default 30); **single-use**; requesting a new link invalidates older ones. Link is emailed through **Brevo**. |
| Reset password | `GET /api/auth/password/reset/validate?token=` then `POST /api/auth/password/reset`. New password is validated and BCrypt-hashed. |
| Change password | `POST /api/auth/password/change` requires the current password (5 wrong attempts → 15-minute lock), validates + confirms the new one, and rejects reusing the current password. |
| Old password stops working | The stored hash is replaced, and `password_changed_at` is updated: every session that signed in before that moment is signed out on its next request. The session that made the change stays signed in. |

### Email (Brevo)
Add to `.env`:
```
BREVO_API_KEY=xkeysib-...
MAIL_FROM_EMAIL=your-verified-sender@example.com
MAIL_FROM_NAME=Sertipiko
FRONTEND_URL=http://localhost:5173
```
The sender email must be verified in Brevo (Senders, Domains & Dedicated IPs → Senders).
If `BREVO_API_KEY` is empty, the reset link is printed in the backend console instead, so the
flow can still be demonstrated locally.

## How the requirements are met

| Requirement | Implementation |
|---|---|
| Registration + validation | `POST /api/auth/register`, Bean Validation on `RegisterRequest`, plus school-domain and password-match checks in `AuthService` |
| No duplicate accounts | `existsByEmail` check + `UNIQUE (email)` constraint → `409 Conflict` |
| Password hashing | `BCryptPasswordEncoder(12)`; only `password_hash` is stored |
| Role assignment | New accounts are always `PARTICIPANT`; admin grants/revokes `ORGANIZER` |
| Login + error messages | `POST /api/auth/login`; `401 Invalid email or password.` (same message for unknown email and wrong password); `403` for disabled; `429` after 5 failed attempts in 15 minutes |
| Secure session | Spring Security `HttpSession` (`JSESSIONID`, HttpOnly, SameSite=Lax), session ID rotated on login, CSRF protection via `XSRF-TOKEN` cookie |
| Logout | `POST /api/auth/logout` invalidates the session and deletes the cookie (`204`) |
| RBAC (backend) | URL rules in `SecurityConfig` (`/api/admin/**` → ADMIN, `/api/organizer/**` → ORGANIZER, `/api/participant/**` → PARTICIPANT) **and** `@PreAuthorize` on controllers |
| Role changes take effect immediately | `SessionUserRefreshFilter` reloads the user on each request; disabled users are signed out, role changes apply without re-login |

## API

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/auth/csrf` | Public | Issues the `XSRF-TOKEN` cookie |
| POST | `/api/auth/register` | Public | `{ fullName, email, department, password, confirmPassword }` → `201` |
| POST | `/api/auth/login` | Public | `{ email, password }` → `200` user + session |
| GET | `/api/auth/me` | Signed in | Current user (includes own `qrToken`) |
| POST | `/api/auth/logout` | Signed in | `204` |
| GET | `/api/participant/dashboard` | PARTICIPANT | |
| GET | `/api/organizer/dashboard` | ORGANIZER | |
| GET | `/api/admin/dashboard` | ADMIN | Includes user counts |
| GET | `/api/admin/users?search=&role=` | ADMIN | |
| PATCH | `/api/admin/users/{id}/role` | ADMIN | `{ "role": "ORGANIZER" }` or `PARTICIPANT` |
| PATCH | `/api/admin/users/{id}/status` | ADMIN | `{ "enabled": false }` |
| PATCH | `/api/admin/users/{id}/name` | ADMIN | `{ "fullName": "..." }` (FR-06 name correction) |
| GET | `/api/profile` | Signed in | Own profile |
| PUT | `/api/profile` | Signed in | `{ department, userType }` |
| POST | `/api/auth/password/change` | Signed in | `{ currentPassword, newPassword, confirmPassword }` |
| POST | `/api/auth/password/forgot` | Public | `{ email }` → `202` (same response either way) |
| GET | `/api/auth/password/reset/validate?token=` | Public | `204` valid, `400` invalid/expired/used |
| POST | `/api/auth/password/reset` | Public | `{ token, newPassword, confirmPassword }` |

Errors are JSON: `{ "status": 400, "message": "...", "errors": { "field": "message" } }`.

## Structure

```
src/main/java/edu/cit/sertipiko/
  config/       SecurityConfig, AppProperties, AdminSeeder
  controller/   AuthController, AdminUserController, DashboardController
  dto/          request/response records
  entity/       User, Role, UserStatus, UserType
  exception/    ApiException, GlobalExceptionHandler
  repository/   UserRepository
  security/     AppUserDetails, LoginAttemptService, SessionUserRefreshFilter, CSRF + JSON handlers
  service/      AuthService, AdminUserService, TokenGenerator
db/migration/   V1__create_users.sql, V2__profile_and_password_reset.sql
```

## Troubleshooting

- **`Could not resolve placeholder 'DB_URL'`** — `.env` is missing or you ran the app from
  another folder. Run it from `backend`.
- **Connection timeout to Supabase** — some school networks block port 5432. Try a
  different network or the transaction pooler (port `6543`, add `&prepareThreshold=0` to `DB_URL`).
- **`relation "users" does not exist`** — run the SQL migration (step 1).
