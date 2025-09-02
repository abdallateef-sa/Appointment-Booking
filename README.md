# Appointment Booking API

A Node.js/Express REST API for an appointment booking system with passwordless OTP login, admin-managed subscription plans, user subscriptions, and per-session scheduling. Includes email notifications with calendar (ICS) attachments when all sessions are booked.

## Tech Stack
- Node.js, Express, MongoDB (Mongoose)
- JWT authentication
- express-validator
- Nodemailer (HTML templates + ICS attachments)
- CORS, Morgan

## Environment Variables
Create a .env file with:

- PORT=4000
- MONGODB_URL=mongodb+srv://...
- JWT_SECRET=your_jwt_secret
- JWT_EXPIRES_IN=7d
- EMAIL_HOST=smtp.example.com
- EMAIL_PORT=587
- EMAIL_USER=your_smtp_user
- EMAIL_PASSWORD=your_smtp_password
- EMAIL_FROM="Appointment Booking <no-reply@example.com>"
- NODE_ENV=development

## Run
- Dev: `npm run start:dev`
- Prod: `npm run start:prod`

Server logs:
- "MongoDB Connected" when DB is OK.
- "server run on port <PORT>" on start.

## API Overview
Base URL: /api/v1

### Public
- GET /plans
  - List active subscription plans (no auth).

### Auth (passwordless)
- POST /auth/send-otp
  - Body: { email }
  - Sends verification OTP email and returns a short-lived token for step 2.
- POST /auth/verify-otp
  - Body: { email, otp }
  # Appointment Booking API

  A clean REST API for subscriptions and session booking. Built with Node.js/Express and MongoDB. Supports passwordless OTP login, admin-managed plans, user subscriptions, single-session scheduling with constraints, and confirmation emails with ICS calendar attachments.

  ## Tech Stack
  - Node.js, Express, MongoDB (Mongoose)
  - JWT authentication, express-validator
  - Nodemailer (HTML templates + ICS attachments)
  - CORS, morgan

  ## Project Structure
  ```
  src/
    server.js
    config/db.js
    routes/ (indexRoute, authRoute, adminRoute, userRoute, profileRoute)
    controllers/ (auth, subscriptionPlan, subscription, session, public, adminView, userView)
    models/ (user, subscriptionPlan, subscription, session)
    middlewares/ (verifyToken, requireAdmin, errorMiddleware, asyncWrapper)
    utils/ (sendMaile, emailTemplates, httpStatusText, appError, validators)
  ```

  ## Environment (.env)
  | Name | Required | Example | Notes |
  |------|----------|---------|-------|
  | PORT | No | 4000 | Defaults to 4000 |
  | MONGODB_URL | Yes | mongodb+srv://... | Connection string |
  | JWT_SECRET | Yes | supersecret | JWT signing secret |
  | JWT_EXPIRES_IN | No | 7d | JWT lifetime |
  | EMAIL_HOST | Yes | smtp.example.com | SMTP host |
  | EMAIL_PORT | Yes | 587 | 465 for SSL |
  | EMAIL_USER | Yes | user | SMTP user |
  | EMAIL_PASSWORD | Yes | pass | SMTP password |
  | EMAIL_FROM | Yes | Appointment Booking <no-reply@example.com> | From address |
  | NODE_ENV | No | development | Enables morgan in dev |

  ## Run
  - Dev: `npm run start:dev`
  - Prod: `npm run start:prod`

  Logs: "MongoDB Connected" after DB connect, and "server run on port <PORT>" on start.

  ## Conventions
  | Item | Value |
  |------|-------|
  | Base URL | `/api/v1` |
  | Auth header | `Authorization: Bearer <token>` |
  | Content type | `application/json` |
  | Date format (input) | `YYYY-MM-DD` |
  | Time format (input) | `HH:mm` (24h) |
  | ICS timezone | UTC (Z) |

  ## Error Shape
  | Field | Type | Example |
  |-------|------|---------|
  | status | string | "fail" or "error" |
  | message | string | "Validation error" |
  | errors? | array | optional validation details |

  ## Data Models (summary)

  SubscriptionPlan
  | Field | Type | Notes |
  |-------|------|-------|
  | name | string | required |
  | description | string | optional |
  | sessionsPerMonth | number | total sessions per subscription |
  | sessionsPerWeek | number | weekly cap |
  | price | number | plan price |
  | currency | enum | EGP/USD/EUR |
  | duration | number | days (e.g., 30) |
  | isActive | boolean | default true |
  | createdBy | ObjectId(Admin) | required |

  Subscription
  | Field | Type | Notes |
  |-------|------|-------|
  | user | ObjectId(User) | required |
  | subscriptionPlan | ObjectId(SubscriptionPlan) | required |
  | startDate | Date | required |
  | endDate | Date | required |
  | status | enum | active/cancelled/expired |
  | totalSessions | number | from plan.sessionsPerMonth |
  | sessionsUsed | number | increment on booking |
  | sessionsRemaining (virtual) | number | total - used |

  Session
  | Field | Type | Notes |
  |-------|------|-------|
  | subscription | ObjectId(Subscription) | required |
  | user | ObjectId(User) | required |
  | startsAt | Date | required, unique per (user, startsAt) |
  | status | enum | scheduled/completed/cancelled/missed |
  | notes | string | optional |

  ## API Summary

  | Method | Path | Auth | Role | Description |
  |--------|------|------|------|-------------|
  | GET | /plans | No | - | List active plans |
  | POST | /auth/send-otp | No | - | Send OTP to email |
  | POST | /auth/verify-otp | No | - | Verify OTP (returns temporary token) |
  | POST | /auth/complete-registration | Yes | User | Complete profile (returns JWT) |
  | POST | /auth/login/send-otp | No | - | Login via OTP (returns JWT) |
  | GET | /profile | Yes | User/Admin | Current user profile |
  | POST | /admin/subscription-plans | Yes | Admin | Create plan |
  | GET | /admin/subscription-plans | Yes | Admin | List plans |
  | GET | /admin/subscription-plans/:id | Yes | Admin | Get plan |
  | PUT | /admin/subscription-plans/:id | Yes | Admin | Update plan |
  | DELETE | /admin/subscription-plans/:id | Yes | Admin | Delete plan |
  | PATCH | /admin/subscription-plans/:id/toggle | Yes | Admin | Toggle active |
  | GET | /admin/subscriptions | Yes | Admin | List subscriptions (filters supported) |
  | GET | /admin/sessions | Yes | Admin | List sessions (filters supported) |
  | POST | /user/subscriptions | Yes | User | Subscribe to plan |
  | GET | /user/subscriptions | Yes | User | My subscriptions |
  | POST | /user/sessions | Yes | User | Create single session |
  | GET | /user/sessions | Yes | User | My sessions |

  ---

  ## Endpoint Details

  ### Public: GET /plans
  | Key | Value |
  |-----|-------|
  | Auth | None |
  | Query | - |
  | Response 200 | `{ status: "success", data: Plan[] }` |

  Plan (response fields)
  | Field | Type |
  |-------|------|
  | _id | string |
  | name | string |
  | description | string |
  | sessionsPerMonth | number |
  | sessionsPerWeek | number |
  | price | number |
  | currency | string |
  | duration | number |

  ### Auth: POST /auth/send-otp
  | Key | Value |
  |-----|-------|
  | Auth | None |
  | Body | `{ email: string }` |
  | Response 200 | `{ status: "success", message: "OTP sent" }` |

  ### Auth: POST /auth/verify-otp
  | Key | Value |
  |-----|-------|
  | Auth | None |
  | Body | `{ email: string, otp: string }` |
  | Response 200 | `{ status: "success", token: string }` (temporary for next step) |

  ### Auth: POST /auth/complete-registration
  | Key | Value |
  |-----|-------|
  | Auth | Bearer (temporary token from verify-otp) |
  | Body | `{ name: string, phone: string }` |
  | Response 200 | `{ status: "success", token: string }` (final JWT) |

  ### Auth: POST /auth/login/send-otp
  | Key | Value |
  |-----|-------|
  | Auth | None |
  | Body | `{ email: string }` |
  | Response 200 | `{ status: "success", token: string }` (JWT) |

  ### Profile: GET /profile
  | Key | Value |
  |-----|-------|
  | Auth | Bearer JWT |
  | Response 200 | `{ status: "success", data: User }` |

  ### Admin: Plans CRUD
  POST /admin/subscription-plans
  | Body field | Type | Required |
  |------------|------|----------|
  | name | string | Yes |
  | description | string | No |
  | sessionsPerMonth | number | Yes |
  | sessionsPerWeek | number | Yes |
  | price | number | Yes |
  | currency | enum(EGP,USD,EUR) | No |
  | duration | number (days) | No (default 30) |

  Other admin endpoints use `:id` as path param and return the plan object.

  ### Admin: GET /admin/subscriptions
  | Key | Value |
  |-----|-------|
  | Auth | Bearer (Admin) |
  | Query | `status=active|cancelled|expired`, `user=<userId>`, `plan=<planId>`, `startDateFrom=YYYY-MM-DD`, `startDateTo=YYYY-MM-DD` |
  | Response 200 | `{ status: "success", data: Subscription[] }` (user and plan populated) |

  ### Admin: GET /admin/sessions
  | Key | Value |
  |-----|-------|
  | Auth | Bearer (Admin) |
  | Query | `status=scheduled|completed|cancelled|missed`, `user=<userId>`, `subscription=<subId>`, `dateFrom`, `dateTo` |
  | Response 200 | `{ status: "success", data: Session[] }` (user and subscription.plan populated) |

  ### User: POST /user/subscriptions
  | Key | Value |
  |-----|-------|
  | Auth | Bearer (User) |
  | Body | `{ subscriptionPlanId: string, startDate: YYYY-MM-DD }` |
  | Response 201 | `{ status, message, data: { subscription: { id, planName, startDate, endDate, totalSessions, sessionsRemaining, status } } }` |

  ### User: GET /user/subscriptions
  | Key | Value |
  |-----|-------|
  | Auth | Bearer (User) |
  | Query | `status` (optional) |
  | Response 200 | `{ status: "success", data: Subscription[] }` |

  ### User: POST /user/sessions
  | Key | Value |
  |-----|-------|
  | Auth | Bearer (User) |
  | Body | `{ subscriptionId: string, date: YYYY-MM-DD, time: HH:mm, notes?: string }` |
  | Constraints | Within subscription window; not in past; no conflicts; respects sessionsPerWeek and total sessions |
  | Response 201 | `{ status, message, data: { session: { id, startsAt, status, notes }, sessionsRemaining } }` |
  | Email | When all sessions are scheduled, a confirmation email is sent with an ICS file containing all sessions (UTC, 60 min default) |

  ### User: GET /user/sessions
  | Key | Value |
  |-----|-------|
  | Auth | Bearer (User) |
  | Query | `status`, `dateFrom`, `dateTo` (optional) |
  | Response 200 | `{ status: "success", data: Session[] }` |

  ## Email & ICS
  | Item | Details |
  |------|---------|
  | Templates | `src/utils/emailTemplates.js` |
  | Confirmation | `generateSessionsConfirmedTemplates` |
  | ICS generator | `buildIcsForSessions` (VEVENT per session, UTC, 60 min) |
  | Sender | `src/utils/sendMaile.js` supports attachments |

  ## Security & Validation
  | Topic | Details |
  |------|---------|
  | Auth | `verifyToken` checks JWT; admin routes also use `requireAdmin` |
  | Validation | `express-validator` used in `utils/validators` |

  ## Notes for Frontend
  | Topic | Guidance |
  |------|----------|
  | Dates/Times | Send `date` (YYYY-MM-DD) and `time` (HH:mm). Server converts to Date; ICS sent in UTC. |
  | Booking UX | Guide user to stay within start/end window and weekly/total caps; handle 409 conflict errors. |
  | Tokens | After registration completion or login, store JWT and send as `Authorization` header. |
  | Lists | Admin listing endpoints do not paginate; add client-side paging if needed. |
Response 201:
{
  "status": "success",
  "message": "Session created successfully",
  "data": {
    "session": { "id": "66f4...", "startsAt": "2025-09-10T15:00:00.000Z", "status": "scheduled", "notes": "Zoom" },
    "sessionsRemaining": 5
  }
}

### User: List My Sessions
Request:
  GET /api/v1/user/sessions?status=scheduled&dateFrom=2025-09-01&dateTo=2025-09-30
  Headers: Authorization: Bearer <jwt>
Response 200:
{ "status": "success", "data": [ { "_id": "66f4...", "startsAt": "2025-09-10T15:00:00.000Z", "status": "scheduled", "subscription": {"_id":"...","subscriptionPlan":{"_id":"...","name":"Silver"}} } ] }

## Email & Calendar Invites
- HTML templates are in `src/utils/emailTemplates.js`.
- Confirmation email for fully booked subscriptions uses `generateSessionsConfirmedTemplates`.
- ICS generation via `buildIcsForSessions`, attaching one VEVENT per session (UTC time, default 60 minutes).
- Mail sending wrapper: `src/utils/sendMaile.js` (supports attachments).

## Data Models (Mongoose)
- User: stores name, email, role (user/admin), etc.
- SubscriptionPlan: plan settings like duration months, sessionsPerMonth, sessionsPerWeek, price, status; createdBy admin.
- Subscription: user, subscriptionPlan, startDate, endDate, status, totalSessions, sessionsUsed; virtual sessionsRemaining.
- Session: subscription, user, startsAt, status, notes; unique index on (user, startsAt).

## Admin Flow
1) Login/Register as admin, obtain JWT.
2) Create subscription plans (/admin/subscription-plans).
3) Monitor subscriptions (/admin/subscriptions) and sessions (/admin/sessions) with filters.
4) Manage plans (update, toggle active, delete) as needed.

## User Flow
1) Registration: send OTP -> verify OTP -> complete registration -> receive JWT.
2) Browse active plans (GET /plans), choose a plan.
3) Subscribe to a plan (POST /user/subscriptions).
4) Schedule sessions one by one (POST /user/sessions) within plan limits.
5) Once all sessions are scheduled, receive confirmation email with ICS calendar attachment.
6) View own subscriptions (/user/subscriptions) and sessions (/user/sessions).

## Error Handling
- Unified error responses with status and message via `AppError` and `errorMiddleware`.
- Common HTTP status text centralized in `src/utils/httpStatusText.js`.

## Security
- JWT verification via `verifyToken` middleware; admin endpoints also use `requireAdmin`.
- Basic request validation using `express-validator` in `utils/validators`.

## Postman Collection
- A Postman collection is included to exercise auth, plan creation, subscription, and session scheduling flows (check repository for JSON file).

## Notes
- Time zone handling: ICS uses UTC (Z). The API expects local date/time strings and converts to Date; ensure client sends correct intended local times.
- If you need per-session duration or custom ICS titles/locations, extend `buildIcsForSessions` and session creation payload.
