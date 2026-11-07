# CivicConnect Backend - Node.js, Express & MongoDB Service 🏛️

> **The REST API engine powering CivicConnect: A Smart Civic Complaint Management System with role-based routing, JWT authentication, bcrypt password hashing, Mongoose schemas, rate limiting, and automated health monitoring.**

---

## 🏗️ 1. Architecture Overview

The backend uses a clean, maintainable **Model-View-Controller (MVC)** design pattern:
- **`app.js`**: Pure Express application configuration (security headers, CORS allowlist, rate limiting, JSON body parsing, cookie parsing, request logger, error handling).
- **`server.js`**: Database initialization, network port listener, and graceful process shutdown handlers (`SIGINT`, `SIGTERM`).
- **`config/database.js`**: Resilient Mongoose connection lifecycle manager with connection masking and automatic disconnect cleanup.
- **`models/`**: Strongly-typed Mongoose models with validation, sanitization, and referential integrity:
  - `User.js`: User accounts with bcrypt hashing (`rounds = 12`), `comparePassword`, and `generateAuthToken` methods.
  - `Complaint.js`: Geo-tagged complaint model with category and lifecycle status.
  - `ComplaintHistory.js`: Immutable chronological audit trail of status changes.
  - `Notification.js`: Alert dispatch documents.
  - `Feedback.js`: Post-resolution citizen satisfaction rating.
- **`middleware/`**:
  - `authMiddleware.js`: Verifies JWT from `Bearer` header or HttpOnly cookie, checks active status, and binds `req.user`.
  - `roleMiddleware.js`: Enforces strict Role-Based Access Control (`authorize(...roles)`).
  - `validatorMiddleware.js`: Request payload validation via `express-validator`.
  - `errorMiddleware.js`: Centralized error handler (hides stack traces in production).
  - `notFoundMiddleware.js`: 404 handler for undefined endpoints.
  - `requestLogger.js`: Morgan HTTP access logger with ISO timestamps.
- **`controllers/`**:
  - `authController.js`: `register`, `login`, `getMe`, and `logout` operations.
- **`routes/`**: Centralized routing system mounted under `/api` (`/api/auth/*`, `/api/health`).

---

## 📁 2. Folder Structure

```text
backend/
├── config/
│   ├── database.js          # Mongoose database connection manager & listeners
│   └── cloudinary.js        # Cloudinary CDN credentials configuration (Phase 5)
│
├── controllers/
│   └── authController.js    # Register, login, getMe, logout logic
│
├── middleware/
│   ├── authMiddleware.js    # JWT verification & req.user attachment
│   ├── roleMiddleware.js    # Role-Based Access Control (RBAC) guard
│   ├── validatorMiddleware.js # Input validation rules & error handling
│   ├── errorMiddleware.js   # Centralized error handler
│   ├── notFoundMiddleware.js# 404 handler for undefined endpoints
│   └── requestLogger.js     # Morgan HTTP access logger
│
├── models/
│   ├── User.js              # Citizen, Admin, and Worker schema with bcrypt hooks
│   ├── Complaint.js         # Geo-tagged complaint model
│   ├── ComplaintHistory.js  # Audit log of complaint transitions
│   ├── Notification.js      # Citizen and worker notifications
│   └── Feedback.js          # Post-resolution citizen feedback
│
├── routes/
│   ├── authRoutes.js        # /api/auth routes (login, register, me, logout)
│   ├── healthRoutes.js      # GET /api/health probe
│   └── index.js             # Central API router mounted at /api
│
├── scripts/
│   └── seedUsers.js         # Default database seed script (Admin, Worker, Citizen)
│
├── services/                # External microservices (Cloudinary, SMS/Email)
│
├── utils/
│   ├── ApiError.js          # Custom operational error class
│   ├── asyncHandler.js      # Route promise wrapper
│   └── tokenUtils.js        # JWT generation, verification, and cookie response
│
├── tests/
│   ├── auth.test.js         # Comprehensive 22-test JWT & RBAC suite
│   ├── health.test.js       # Express routes, security headers & 404 tests
│   └── database.test.js     # Mongoose schema validation & ID generation tests
│
├── app.js                   # Express application setup
├── server.js                # Database connection & HTTP startup
├── .env.example             # Documented template for environment variables
├── package.json             # NPM dependencies & test scripts
└── README.md                # Backend documentation
```

---

## 🛡️ 3. Authentication & RBAC Architecture (Phase 4)

### User Roles
- **`citizen`**: Can register publicly, report complaints, track status, and submit feedback.
- **`admin`**: Full municipal administrative rights, oversees complaints, manages workers and analytics.
- **`worker`**: Assigned field maintenance worker, views tasks and updates resolution progress.

### Security Highlights
1. **Password Hashing**: Uses `bcryptjs` with salt work factor of 12. Password field is explicitly omitted in JSON serialization (`select: false` and `toJSON` delete).
2. **Strict Registration**: Public registration `/api/auth/register` strictly enforces `role: 'citizen'`. Any user attempting to pass `role: 'admin'` or `role: 'worker'` is forced to `'citizen'` to prevent privilege escalation.
3. **Dual Token Delivery**: Returns signed JWT both in JSON response body (`token`) and in an `HttpOnly`, `SameSite=Lax` cookie.
4. **Rate Limiting**: Authentication endpoints are rate-limited to 20 requests per 15 minutes to thwart brute-force attacks.

---

## 🔑 4. Seeded Default Accounts

Run the seed script to populate default users in MongoDB:

```powershell
cd backend
npm run seed
```

| Role | Email | Password | Department / Ward |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@civicconnect.org` | `Admin@12345` | Municipal Corporation Head Office |
| **Worker** | `worker@civicconnect.org` | `Worker@12345` | Roads & Public Infrastructure |
| **Citizen** | `citizen@civicconnect.org` | `Citizen@12345` | Ward 4 - South Green Park |

---

## 📡 5. Authentication API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public (Rate-limited) | Register a new citizen account |
| `POST` | `/api/auth/login` | Public (Rate-limited) | Authenticate user with email and password |
| `GET` | `/api/auth/me` | Protected (`Bearer` or Cookie) | Fetch current authenticated profile |
| `POST` | `/api/auth/logout` | Public / Protected | Clears authentication cookie |
| `GET` | `/api/auth/admin-check` | Protected (`admin` only) | RBAC test probe for admin role |

---

## ⚙️ 6. Environment Variables Configuration

Copy `.env.example` to create your local `.env`:

```powershell
Copy-Item .env.example .env
```

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port on which the Express server listens |
| `NODE_ENV` | `development` | Environment mode (`development`, `production`, `test`) |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed frontend origin for CORS policies |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/civicconnect` | MongoDB connection URI |
| `JWT_SECRET` | *(Random secret)* | Secret key used for signing JWT tokens |
| `JWT_EXPIRES_IN` | `1d` | Token expiry duration |
| `COOKIE_SECURE` | `false` | Set to `true` in production with HTTPS |
| `COOKIE_SAME_SITE` | `lax` | Cookie same-site policy |

---

## 🧪 7. Automated Testing

Run the automated test suite with Jest:

```powershell
cd backend
npm test
```

### Test Coverage (33/33 Tests Passing)
- **`tests/auth.test.js`** (22 tests): Registration validation, password hashing, duplicate email rejection, role escalation prevention, login verification, inactive user blocking, JWT verification, role-based route protection (`citizen`, `worker`, `admin`), and logout.
- **`tests/health.test.js`** (5 tests): Server startup, routing, security headers (Helmet), health check payload, and 404 handler.
- **`tests/database.test.js`** (6 tests): Mongoose schema validation for User, Complaint, Feedback, and complaint ID auto-generation (`CC-YYYY-XXXX`).
