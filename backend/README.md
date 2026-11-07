# CivicConnect Backend - Node.js, Express & MongoDB Service 🏛️

> **The REST API engine powering CivicConnect: A Smart Civic Complaint Management System with role-based routing, JWT authentication, complaint lifecycle workflows, Cloudinary photo uploads, geospatial indexing, real-time analytics aggregations, and administrative telemetry.**

---

## 🏗️ 1. Architecture Overview

The backend follows the **Model-View-Controller (MVC)** architectural pattern:
- **`app.js`**: Pure Express application configuration (security headers, CORS allowlist, rate limiting, JSON & urlencoded body parsing, cookie parsing, request logger, error handling).
- **`server.js`**: Database initialization, network port listener, and graceful process shutdown handlers (`SIGINT`, `SIGTERM`).
- **`config/database.js`**: Resilient Mongoose connection lifecycle manager with connection masking and automatic disconnect cleanup.
- **`config/cloudinary.js`**: Cloudinary SDK client configuration.
- **`services/cloudinaryService.js`**: Streams Multer memory buffers to Cloudinary folders (`civicconnect/complaints` and `civicconnect/resolutions`) with an offline test fallback.
- **`models/`**: Strongly-typed Mongoose models:
  - `User.js`: User accounts with bcrypt hashing (`rounds = 12`), `comparePassword`, `generateAuthToken`, and municipal worker `trade`.
  - `Complaint.js`: Geo-tagged complaint model with `2dsphere` geospatial indexing (`[longitude, latitude]`), photo URLs, and lifecycle status.
  - `ComplaintHistory.js`: Immutable chronological audit trail of status and assignment changes.
  - `Notification.js`: Alert dispatch documents.
  - `Feedback.js`: Post-resolution citizen satisfaction rating.
- **`middleware/`**:
  - `authMiddleware.js`: Verifies JWT from `Bearer` header or HttpOnly cookie, checks active status, and binds `req.user`.
  - `roleMiddleware.js`: Enforces strict Role-Based Access Control (`authorize(...roles)`).
  - `uploadMiddleware.js`: Multer memory storage with 5MB file limits and JPEG, PNG, WebP validation.
  - `complaintValidation.js`: Request payload validation via `express-validator`.
  - `errorMiddleware.js`: Centralized error handler.
- **`controllers/`**:
  - `authController.js`: `register`, `login`, `getMe`, and `logout`.
  - `complaintController.js`: Citizen complaint creation, personal listings, details, and audit history.
  - `adminComplaintController.js`: Admin verification, rejection, worker assignment, priority modification, and municipal stats.
  - `adminWorkerController.js`: Admin municipal worker registry, workload aggregation, and worker registration.
  - `adminUserController.js`: Admin user directory, complaint counts, and activation status toggle.
  - `analyticsController.js`: Real-time MongoDB aggregations for municipal overview, ward breakdown, worker workloads, and geocoded locations.
  - `workerComplaintController.js`: Worker assigned task listing, details, start work, and resolution with proof photos.
  - `workerAnalyticsController.js`: Worker personal metrics, turnaround velocity, and assigned task location mapping.
- **`routes/`**: Centralized routing system mounted under `/api` (`/api/auth/*`, `/api/complaints/*`, `/api/admin/complaints/*`, `/api/admin/analytics/*`, `/api/admin/workers/*`, `/api/admin/users/*`, `/api/workers/complaints/*`, `/api/workers/analytics/*`, `/api/health`).

---

## 📁 2. Folder Structure

```text
backend/
├── config/
│   ├── database.js               # Mongoose database connection manager & listeners
│   └── cloudinary.js             # Cloudinary CDN credentials configuration
│
├── controllers/
│   ├── authController.js         # Register, login, getMe, logout logic
│   ├── complaintController.js    # Citizen complaint submission & details
│   ├── adminComplaintController.js # Admin verification, rejection, assignment
│   ├── adminWorkerController.js  # Municipal worker registry & active workloads
│   ├── adminUserController.js    # User directory & activation status toggles
│   ├── analyticsController.js    # MongoDB aggregations (overview, wards, locations)
│   ├── workerComplaintController.js# Worker task execution & resolution
│   └── workerAnalyticsController.js# Worker personal metrics & task locations
│
├── middleware/
│   ├── authMiddleware.js         # JWT verification & req.user attachment
│   ├── roleMiddleware.js         # Role-Based Access Control (RBAC) guard
│   ├── uploadMiddleware.js       # Multer memory storage & image MIME validation
│   ├── complaintValidation.js    # Express-validator rules for complaint workflows
│   ├── validatorMiddleware.js    # Input validation rules for auth
│   ├── errorMiddleware.js        # Centralized error handler
│   ├── notFoundMiddleware.js     # 404 handler for undefined endpoints
│   └── requestLogger.js          # Morgan HTTP access logger
│
├── models/
│   ├── User.js                   # Citizen, Admin, and Worker schema
│   ├── Complaint.js              # Geo-tagged complaint model with 2dsphere index
│   ├── ComplaintHistory.js       # Audit log of complaint transitions
│   ├── Notification.js           # Citizen and worker notifications
│   └── Feedback.js               # Post-resolution citizen feedback
│
├── routes/
│   ├── authRoutes.js             # /api/auth routes
│   ├── complaintRoutes.js        # /api/complaints routes (Citizen)
│   ├── adminComplaintRoutes.js   # /api/admin/complaints routes (Admin)
│   ├── adminAnalyticsRoutes.js   # /api/admin/analytics routes (Admin)
│   ├── adminWorkerRoutes.js      # /api/admin/workers routes (Admin)
│   ├── adminUserRoutes.js        # /api/admin/users routes (Admin)
│   ├── workerComplaintRoutes.js  # /api/workers/complaints routes (Worker)
│   ├── workerAnalyticsRoutes.js  # /api/workers/analytics routes (Worker)
│   ├── healthRoutes.js           # GET /api/health probe
│   └── index.js                  # Central API router mounted at /api
│
├── scripts/
│   └── seedUsers.js              # Default database seed script (Admin, Worker, Citizen)
│
├── services/
│   └── cloudinaryService.js      # Cloudinary upload streaming & fallback service
│
├── utils/
│   ├── ApiError.js               # Custom operational error class
│   ├── asyncHandler.js           # Route promise wrapper
│   └── tokenUtils.js             # JWT generation, verification, and cookie response
│
├── tests/
│   ├── adminAnalytics.test.js    # Admin analytics, wards, workers & user mgmt tests
│   ├── workerAnalytics.test.js   # Worker personal stats & location coordinates tests
│   ├── complaint.test.js         # Citizen complaint submission & ownership tests
│   ├── adminComplaint.test.js    # Admin verification, rejection & assignment tests
│   ├── workerComplaint.test.js   # Worker task execution & resolution proof tests
│   ├── auth.test.js              # Comprehensive 22-test JWT & RBAC suite
│   ├── health.test.js            # Express routes, security headers & 404 tests
│   └── database.test.js          # Mongoose schema validation & ID generation tests
│
├── app.js                        # Express application setup
├── server.js                     # Database connection & HTTP startup
├── .env.example                  # Documented template for environment variables
├── package.json                  # NPM dependencies & test scripts
└── README.md                     # Backend documentation
```

---

## 📡 3. REST API Endpoints Specification

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new Citizen account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Protected | Retrieve authenticated profile |
| `POST` | `/api/auth/logout` | Protected | Clear session cookie |

### 📝 Citizen Complaints (`/api/complaints`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/complaints` | Citizen | Submit a new geo-tagged complaint with image |
| `GET` | `/api/complaints/my` | Citizen | View personal complaints with pagination & filters |
| `GET` | `/api/complaints/:id` | Citizen / Authorized | View full complaint details |
| `PATCH`| `/api/complaints/:id` | Citizen (Owner) | Update complaint while in SUBMITTED state |
| `GET` | `/api/complaints/:id/history` | Authorized | View chronological timeline & status audit trail |

### 🛠️ Administrative Operations & Analytics (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/complaints` | Admin | Search, filter, and paginate all complaints across wards |
| `GET` | `/api/admin/complaints/stats` | Admin | Quick status aggregation counts |
| `PATCH`| `/api/admin/complaints/:id/verify` | Admin | Verify reported grievance |
| `PATCH`| `/api/admin/complaints/:id/reject` | Admin | Reject invalid report with mandatory explanation |
| `PATCH`| `/api/admin/complaints/:id/assign` | Admin | Dispatch ticket to municipal field worker |
| `PATCH`| `/api/admin/complaints/:id/priority`| Admin | Adjust priority (LOW, MEDIUM, HIGH, EMERGENCY) |
| `GET` | `/api/admin/analytics/overview` | Admin | Overview KPIs, status breakdown, category, priority, trends |
| `GET` | `/api/admin/analytics/workers` | Admin | Field worker performance, active workload & turnaround |
| `GET` | `/api/admin/analytics/wards` | Admin | Ward-level grievance distribution & resolution rates |
| `GET` | `/api/admin/analytics/complaint-locations` | Admin | Pinned GPS coordinates for OpenStreetMap visualization |
| `GET` | `/api/admin/workers` | Admin | List all registered municipal field workers |
| `POST`| `/api/admin/workers` | Admin | Register a new field officer into municipal registry |
| `GET` | `/api/admin/users` | Admin | Searchable stakeholder directory (Citizens, Workers, Admins) |
| `PATCH`| `/api/admin/users/:id/toggle-status` | Admin | Toggle account activation (with self-deactivation guard) |

### 👷 Municipal Field Worker Operations (`/api/workers`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/workers/complaints` | Worker | View assigned tasks with status and priority filtering |
| `GET` | `/api/workers/complaints/:id`| Worker | Detailed inspection of assigned work order |
| `PATCH`| `/api/workers/complaints/:id/start` | Worker | Transition task status from `ASSIGNED` to `IN_PROGRESS` |
| `PATCH`| `/api/workers/complaints/:id/resolve` | Worker | Complete repair with completion remarks & proof photo |
| `GET` | `/api/workers/analytics/overview` | Worker | Personal workload stats, urgent count & completion rate |
| `GET` | `/api/workers/analytics/task-locations` | Worker | Geographic locations of tasks assigned to this worker |

---

## 🧪 4. Automated Testing

All endpoints are validated through automated test suites using **Jest** and **Supertest**:
```bash
npm test
```
**Results:** 8 Passed Suites, 70 Tests, 100% Passing.
