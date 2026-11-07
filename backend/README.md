# CivicConnect Backend - Node.js, Express & MongoDB Service 🏛️

> **The REST API engine powering CivicConnect: A Smart Civic Complaint Management System with role-based routing, JWT authentication, complaint lifecycle workflows, Cloudinary photo uploads, geospatial indexing, and automated audit trails.**

---

## 🏗️ 1. Architecture Overview

The backend follows the **Model-View-Controller (MVC)** architectural pattern:
- **`app.js`**: Pure Express application configuration (security headers, CORS allowlist, rate limiting, JSON & urlencoded body parsing, cookie parsing, request logger, error handling).
- **`server.js`**: Database initialization, network port listener, and graceful process shutdown handlers (`SIGINT`, `SIGTERM`).
- **`config/database.js`**: Resilient Mongoose connection lifecycle manager with connection masking and automatic disconnect cleanup.
- **`config/cloudinary.js`**: Cloudinary SDK client configuration.
- **`services/cloudinaryService.js`**: Streams Multer memory buffers to Cloudinary folders (`civicconnect/complaints` and `civicconnect/resolutions`) with an offline test fallback.
- **`models/`**: Strongly-typed Mongoose models:
  - `User.js`: User accounts with bcrypt hashing (`rounds = 12`), `comparePassword`, and `generateAuthToken`.
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
  - `workerComplaintController.js`: Worker assigned task listing, details, start work, and resolution with proof photos.
- **`routes/`**: Centralized routing system mounted under `/api` (`/api/auth/*`, `/api/complaints/*`, `/api/admin/complaints/*`, `/api/workers/complaints/*`, `/api/health`).

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
│   └── workerComplaintController.js# Worker task execution & resolution
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
│   ├── workerComplaintRoutes.js  # /api/workers/complaints routes (Worker)
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

## 🔄 3. Core Complaint Lifecycle Workflow (Phase 5)

```text
[Citizen] ──(Submits report with GPS & Photos)──> [SUBMITTED]
                                                      │
                                           (Admin review desk)
                                                      │
                         ┌────────────────────────────┴────────────────────────────┐
                         ▼                                                         ▼
                 [VERIFIED]                                                    [REJECTED]
                         │                                              (Requires rejectionReason)
                 (Admin assigns worker)
                         │
                         ▼
                 [ASSIGNED]
                         │
              (Worker arrives on site)
                         │
                         ▼
                [IN_PROGRESS]
                         │
            (Worker finishes repair &
             uploads proof photos)
                         │
                         ▼
                 [RESOLVED]
                         │
            (Citizen submits 5-star rating)
                         │
                         ▼
             [CITIZEN_FEEDBACK]
```

---

## 📡 4. REST API Endpoints Matrix

### 👤 Citizen Endpoints (`/api/complaints`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/complaints` | Citizen only | Submit new complaint with photo proof and GPS coordinates |
| `GET` | `/api/complaints/my` | Citizen only | List all complaints submitted by the authenticated citizen |
| `GET` | `/api/complaints/:id` | Owner, Admin, Worker | Get detailed complaint dossier |
| `PATCH` | `/api/complaints/:id` | Owner only | Update complaint details while in `SUBMITTED` status |
| `GET` | `/api/complaints/:id/history` | Owner, Admin, Worker | View chronological status transition audit trail |

### 🏛️ Municipal Admin Endpoints (`/api/admin/complaints`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/complaints` | Admin only | List all complaints with pagination, search, and filters |
| `GET` | `/api/admin/complaints/stats` | Admin only | Aggregated status counts for municipal dashboard |
| `PATCH` | `/api/admin/complaints/:id/verify` | Admin only | Verify submitted complaint and approve for assignment |
| `PATCH` | `/api/admin/complaints/:id/reject` | Admin only | Reject invalid or duplicate complaint with required reason |
| `PATCH` | `/api/admin/complaints/:id/assign` | Admin only | Dispatch verified complaint to an active field worker |
| `PATCH` | `/api/admin/complaints/:id/priority` | Admin only | Modify complaint urgency level (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) |

### 👷 Field Worker Endpoints (`/api/workers/complaints`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/workers/complaints` | Worker only | List complaints assigned to the authenticated worker |
| `GET` | `/api/workers/complaints/:id` | Worker only | Inspect assigned complaint location and details |
| `PATCH` | `/api/workers/complaints/:id/start` | Worker only | Mark task as `IN_PROGRESS` upon site arrival |
| `PATCH` | `/api/workers/complaints/:id/resolve` | Worker only | Mark task as `RESOLVED` with mandatory completion photograph |

---

## 🗺️ 5. Geospatial Data & MongoDB Indexing

GeoJSON Point geometry is stored in the `locationGeo` field:

```javascript
locationGeo: {
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: [73.8567, 18.5204] // [longitude, latitude]
}
```

> [!NOTE]
> In GeoJSON standard format, coordinate order is strictly **`[longitude, latitude]`**.
> Indexed with a **`2dsphere`** index for spatial range and proximity operations.

---

## 📸 6. Photo Uploads & Cloudinary Integration

- Handled via **Multer memory storage**: Files are streamed directly to Cloudinary without persisting temporary binary files on disk.
- Maximum file size: **5 MB per image**.
- Maximum file count: **5 images per submission**.
- Accepted formats: **JPEG, PNG, WebP**.
- Cloudinary folders:
  - Evidence photos: `civicconnect/complaints`
  - Completion proof: `civicconnect/resolutions`
- Safe offline fallback: When running without Cloudinary API credentials or in test environments, deterministic CDN image URLs are provided automatically so development and automated tests never crash.

---

## 🧪 7. Automated Testing (58/58 Tests Passing)

Run all backend test suites with Jest and Supertest:

```powershell
cd backend
npm test
```

```text
PASS tests/complaint.test.js (10 tests)
PASS tests/adminComplaint.test.js (9 tests)
PASS tests/workerComplaint.test.js (6 tests)
PASS tests/auth.test.js (22 tests)
PASS tests/health.test.js (5 tests)
PASS tests/database.test.js (6 tests)

Test Suites: 6 passed, 6 total
Tests:       58 passed, 58 total
Snapshots:   0 total
Time:        7.061 s
```
