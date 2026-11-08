# CivicConnect Backend - Node.js, Express, MongoDB & Socket.IO Service 🏛️⚡

> **The real-time REST and WebSocket engine powering CivicConnect: A Smart Civic Complaint Management System with role-based routing, JWT authentication, complaint lifecycle workflows, Cloudinary photo uploads, geospatial indexing, real-time analytics aggregations, and bi-directional Socket.IO notifications.**

---

## 🏗️ 1. Architecture Overview

The backend follows the **Model-View-Controller (MVC)** architectural pattern enhanced with real-time event-driven WebSocket capabilities:
- **`app.js`**: Pure Express application configuration (security headers via Helmet, CORS allowlist, rate limiting, JSON & urlencoded body parsing, cookie parsing, request logger, error handling).
- **`server.js`**: Database initialization, HTTP server wrapping (`http.createServer(app)`), Socket.IO server initialization (`initSocket(server)`), network port listener, and graceful process shutdown handlers (`SIGINT`, `SIGTERM`).
- **`config/database.js`**: Resilient Mongoose connection lifecycle manager with connection masking and automatic disconnect cleanup.
- **`config/cloudinary.js`**: Cloudinary SDK client configuration.
- **`services/cloudinaryService.js`**: Streams Multer memory buffers to Cloudinary folders (`civicconnect/complaints` and `civicconnect/resolutions`) with strict production credential validation.
- **`services/socketService.js`**: Socket.IO server singleton managing authenticated user rooms (`user:<userId>`), role rooms (`role:admin`, `role:worker`), and broadcast helpers (`emitToUser`, `emitToRole`, `emitToAll`).
- **`models/`**: Strongly-typed Mongoose models:
  - `User.js`: User accounts with bcrypt hashing (`rounds = 12`), `comparePassword`, `generateAuthToken`, and municipal worker `trade`.
  - `Complaint.js`: Geo-tagged complaint model with `2dsphere` geospatial indexing (`[longitude, latitude]`), photo URLs, and lifecycle status.
  - `ComplaintHistory.js`: Immutable chronological audit trail of status and assignment changes.
  - `Notification.js`: Real-time alert documents with read/unread tracking and complaint references.
  - `Feedback.js`: Post-resolution citizen satisfaction rating (1-5 stars) and qualitative observations.
- **`middleware/`**:
  - `authMiddleware.js`: Verifies JWT from `Bearer` header or HttpOnly cookie, checks active status, and binds `req.user`.
  - `roleMiddleware.js`: Enforces strict Role-Based Access Control (`authorize(...roles)`).
  - `uploadMiddleware.js`: Multer memory storage with 5MB file limits and JPEG, PNG, WebP validation.
  - `complaintValidation.js`: Request payload validation via `express-validator`.
  - `errorMiddleware.js`: Centralized error handler with structured status code categorization.
- **`controllers/`**:
  - `authController.js`: `register`, `login`, `getMe`, and `logout`.
  - `complaintController.js`: Citizen complaint creation, personal listings, details, and audit history.
  - `adminComplaintController.js`: Admin verification, rejection, worker assignment, priority modification, and municipal stats.
  - `adminWorkerController.js`: Admin municipal worker registry, workload aggregation, and worker registration.
  - `adminUserController.js`: Admin user directory, complaint counts, and activation status toggle.
  - `analyticsController.js`: Real-time MongoDB aggregations for municipal overview, ward breakdown, worker workloads, and geocoded locations.
  - `workerComplaintController.js`: Worker assigned task listing, details, start work, and resolution with proof photos.
  - `workerAnalyticsController.js`: Worker personal metrics, turnaround velocity, and assigned task location mapping.
  - `notificationController.js`: Persisted alerts, unread counters, and real-time Socket.IO dispatch.
  - `feedbackController.js`: Citizen 5-star resolution rating, qualitative comments, and municipal review registry.
- **`routes/`**: Centralized routing system mounted under `/api` (`/api/auth/*`, `/api/complaints/*`, `/api/admin/complaints/*`, `/api/admin/analytics/*`, `/api/admin/workers/*`, `/api/admin/users/*`, `/api/workers/complaints/*`, `/api/workers/analytics/*`, `/api/notifications/*`, `/api/feedback/*`, `/api/health`).

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
│   ├── workerAnalyticsController.js# Worker personal metrics & task locations
│   ├── notificationController.js # Alert persistence & unread counts
│   └── feedbackController.js     # Citizen resolution feedback & rating
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
│   ├── Notification.js           # Real-time notification documents
│   └── Feedback.js               # Post-resolution citizen satisfaction rating
│
├── routes/
│   ├── authRoutes.js             # /api/auth routes
│   ├── complaintRoutes.js        # /api/complaints routes (Citizen & feedback submission)
│   ├── adminComplaintRoutes.js   # /api/admin/complaints routes (Admin)
│   ├── adminAnalyticsRoutes.js   # /api/admin/analytics routes (Admin)
│   ├── adminWorkerRoutes.js      # /api/admin/workers routes (Admin)
│   ├── adminUserRoutes.js        # /api/admin/users routes (Admin)
│   ├── workerComplaintRoutes.js  # /api/workers/complaints routes (Worker)
│   ├── workerAnalyticsRoutes.js  # /api/workers/analytics routes (Worker)
│   ├── notificationRoutes.js     # /api/notifications routes
│   ├── feedbackRoutes.js         # /api/feedback routes (Admin)
│   ├── healthRoutes.js           # GET /api/health probe
│   └── index.js                  # Central API router mounted at /api
│
├── scripts/
│   └── seedUsers.js              # Default database seed script (Admin, Worker, Citizen)
│
├── services/
│   ├── cloudinaryService.js      # Cloudinary upload streaming & fallback service
│   └── socketService.js          # Authenticated Socket.IO server & room manager
│
├── utils/
│   ├── ApiError.js               # Custom operational error class
│   ├── asyncHandler.js           # Route promise wrapper
│   └── tokenUtils.js             # JWT generation, verification, and cookie response
│
├── tests/
│   ├── integration.test.js       # Phase 7 feedback, notifications & socket tests
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
├── server.js                     # HTTP + Socket.IO server initialization
├── .env.example                  # Documented template for environment variables
├── package.json                  # NPM dependencies & test scripts
└── README.md                     # Backend documentation
```

---

## ⚡ 3. Real-Time Socket.IO Event Dictionary

| Event Name | Direction | Room Target | Payload Summary |
| :--- | :--- | :--- | :--- |
| `notification:received` | Server → Client | `user:<userId>` | New persisted `Notification` document |
| `notification:count` | Server → Client | `user:<userId>` | `{ unreadCount: Number }` |
| `complaint:created` | Server → Client | `role:admin` | `{ complaintId, title, category, priority, ward }` |
| `complaint:assigned` | Server → Client | `user:<workerId>` | `{ complaintId, title, ward, priority }` |
| `complaint:updated` | Server → Client | `user:<citizenId>`, `role:admin` | `{ complaintId, status, workerName? }` |
| `complaint:resolved` | Server → Client | `user:<citizenId>`, `role:admin` | `{ complaintId, status: 'RESOLVED', remarks }` |
| `feedback:submitted` | Server → Client | `role:admin`, `user:<workerId>` | `{ complaintId, rating, comment, ward }` |

---

## 📡 4. REST API Endpoints Specification

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
| `POST` | `/api/complaints/:id/feedback`| Citizen (Owner) | Submit 1-5 star rating and feedback upon resolution |
| `GET` | `/api/complaints/:id/feedback` | Authorized | Retrieve submitted citizen feedback for complaint |

### 🔔 Real-Time Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Protected | List user notifications with unread counter |
| `PATCH`| `/api/notifications/:id/read` | Protected | Mark specific notification as read |
| `PATCH`| `/api/notifications/read-all` | Protected | Mark all user notifications as read |

### 💬 Citizen Feedback (`/api/feedback`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/feedback` | Citizen | Submit resolution feedback |
| `GET` | `/api/feedback/complaint/:id`| Authorized | View feedback for specific resolved complaint |
| `GET` | `/api/feedback` | Admin | List all municipal feedback submissions |

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

## 🧪 5. Automated Testing

All endpoints and integration workflows are validated through automated test suites using **Jest** and **Supertest**:
```bash
npm test
```
**Results:** 9 Passed Suites, 81 Tests, 100% Passing.
