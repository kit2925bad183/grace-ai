# GRACE AI — Production Upgrade Summary

Production-oriented authentication and session security upgrade for the GRACE AI full-stack platform.

## Authentication (Production)

- Email/password registration with **Zod validation** and bcrypt (12 rounds)
- **Email verification** with hashed tokens (24h expiry)
- **Forgot / reset password** with hashed tokens (1h expiry)
- **HTTP-only cookie sessions** — access token (15m) + refresh token (7d)
- **No JWT in localStorage**
- Account lockout after 5 failed login attempts (15 min)
- Generic error messages (no email enumeration)
- Profile update + change password APIs

## Google Sign-In

- Real OAuth 2.0 via Passport (`GET /api/auth/google`, callback route)
- ID token verification endpoint (`POST /api/auth/google/token`)
- Account linking for matching verified emails
- Requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`

## Development Email

When `EMAIL_PROVIDER=console` (default in development), verification and reset links are printed to the backend console.

## Seed Safety

| Command | Purpose |
|---------|---------|
| `npm run seed` | Blocked — prints safety warning |
| `npm run seed:demo` | Development/demo database reset only |

**Never run `seed:demo` against production.**

## Environment Variables

See `.env.example` and `frontend/.env.example` for the full list.

## Tests

```bash
cd backend && npm run test
```

9 auth integration tests covering registration, login, cookies, refresh, forgot-password, and RBAC.

## Deployment Readiness

- Frontend build: Vercel-ready (`frontend/vercel.json`)
- Backend build: Render-ready (`backend/render.yaml`)
- Configure MongoDB Atlas, JWT secrets, Google OAuth, and email provider for production

## Honest Limitations

- AI modules remain **rule-based demo intelligence** — not trained ML
- Google Sign-In requires your Google Cloud OAuth credentials
- Email delivery requires SMTP or a transactional provider in production
- Deployment is **prepared** but not executed from this repository
