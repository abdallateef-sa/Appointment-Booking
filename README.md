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
  - Verifies OTP; returns a token to complete registration.
- POST /auth/complete-registration (requires Bearer token from verify-otp)
  - Body: { name, phone }
  - Completes profile and issues a JWT.
- POST /auth/login/send-otp
  - Body: { email }
  - Sends login OTP and returns JWT after validation (flow handled in controller).

### Profile
- GET /profile (auth)
  - Returns current user profile.

### Admin
All require Bearer token for an admin user.

- POST /admin/subscription-plans
  - Create a plan. Fields include name, price, duration (months), sessionsPerMonth, sessionsPerWeek, status.
- GET /admin/subscription-plans
  - List all plans (with pagination in controller, if present in your version).
- GET /admin/subscription-plans/:id
  - Get plan by id.
- PUT /admin/subscription-plans/:id
  - Update plan.
- DELETE /admin/subscription-plans/:id
  - Delete plan.
- PATCH /admin/subscription-plans/:id/toggle
  - Toggle plan active/inactive.
- GET /admin/subscriptions
  - List all subscriptions. Optional query: status, user, plan, startDateFrom, startDateTo. (Pagination removed.)
- GET /admin/sessions
  - List all sessions. Optional query: status, user, subscription, dateFrom, dateTo. (Pagination removed.)

### User
All require Bearer token for a normal user.

- POST /user/subscriptions
  - Subscribe to a plan.
  - Body: { subscriptionPlanId, startDate }
  - Enforces one active subscription per plan and only active plans.
- POST /user/sessions
  - Create a single session.
  - Body: { subscriptionId, date, time, notes? }
  - Constraints:
    - Within subscription window (startDate..endDate)
    - Not in the past
    - No conflict with existing user sessions at the same time
    - Weekly cap (sessionsPerWeek)
    - Total cap (sessionsPerMonth)
  - When subscription reaches total sessions, sends a confirmation email with an ICS file containing all sessions.
- GET /user/subscriptions
  - List current user subscriptions. Optional query: status. (Pagination removed.)
- GET /user/sessions
  - List current user sessions. Optional query: status, dateFrom, dateTo. (Pagination removed.)

## Examples

### Public: List Active Plans
Request:
  GET /api/v1/plans
Response 200:
{
  "status": "success",
  "data": [
    { "_id": "66f1...", "name": "Gold", "price": 500, "currency": "EGP", "isActive": true, "sessionsPerMonth": 8, "sessionsPerWeek": 3, "duration": 30 }
  ]
}

### Auth Flow (Registration)
1) Send OTP
  POST /api/v1/auth/send-otp
  Body:
  { "email": "user@example.com" }
  Response 200: { "status": "success", "message": "OTP sent" }

2) Verify OTP
  POST /api/v1/auth/verify-otp
  Body:
  { "email": "user@example.com", "otp": "123456" }
  Response 200: { "status": "success", "token": "<temp-token>" }

3) Complete Registration
  POST /api/v1/auth/complete-registration
  Headers: Authorization: Bearer <temp-token>
  Body:
  { "name": "Ahmed Ali", "phone": "+201234567890" }
  Response 200: { "status": "success", "token": "<jwt>" }

### Admin: Create Subscription Plan
Request:
  POST /api/v1/admin/subscription-plans
  Headers: Authorization: Bearer <admin-jwt>
  Body:
  {
    "name": "Silver",
    "description": "Good balance",
    "sessionsPerMonth": 6,
    "sessionsPerWeek": 2,
    "price": 300,
    "currency": "EGP",
    "duration": 30
  }
Response 201:
{ "status": "success", "data": { "_id": "66f1...", "name": "Silver", "isActive": true, "createdBy": "66f0..." } }

### Admin: List Sessions (filtered)
Request:
  GET /api/v1/admin/sessions?status=scheduled&dateFrom=2025-09-01&dateTo=2025-09-30
  Headers: Authorization: Bearer <admin-jwt>
Response 200:
{ "status": "success", "data": [ { "_id": "66f2...", "startsAt": "2025-09-10T15:00:00.000Z", "status": "scheduled", "user": {"_id":"...","name":"Ahmed","email":"user@example.com"}, "subscription": {"_id":"...","subscriptionPlan":{"_id":"...","name":"Silver"}} } ] }

### User: Subscribe to Plan
Request:
  POST /api/v1/user/subscriptions
  Headers: Authorization: Bearer <jwt>
  Body:
  { "subscriptionPlanId": "66f1...", "startDate": "2025-09-05" }
Response 201:
{
  "status": "success",
  "message": "Subscribed successfully",
  "data": {
    "subscription": {
      "id": "66f3...",
      "planName": "Silver",
      "startDate": "2025-09-05T00:00:00.000Z",
      "endDate": "2025-10-05T00:00:00.000Z",
      "totalSessions": 6,
      "sessionsRemaining": 6,
      "status": "active"
    }
  }
}

### User: Create Session (single)
Request:
  POST /api/v1/user/sessions
  Headers: Authorization: Bearer <jwt>
  Body:
  { "subscriptionId": "66f3...", "date": "2025-09-10", "time": "15:00", "notes": "Zoom" }
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
