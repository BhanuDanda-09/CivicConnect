# CivicConnect Backend - Node.js, Express & MongoDB Service 🏛️

> **The REST API engine powering CivicConnect: A Smart Civic Complaint Management System with role-based routing, Mongoose schemas, rate limiting, and automated health monitoring.**

---

## 🏗️ 1. Architecture Overview

The backend uses a clean, maintainable **Model-View-Controller (MVC)** design pattern:
- **`app.js`**: Pure Express application configuration (security headers, CORS allowlist, rate limiting, JSON body parsing, request logger, error handling).
- **`server.js`**: Database initialization, network port listener, and graceful process shutdown handlers (`SIGINT`, `SIGTERM`).
- **`config/database.js`**: Resilient Mongoose connection lifecycle manager with connection masking and automatic disconnect cleanup.
- **`models/`**: Strongly-typed Mongoose models with validation, sanitization, and referential integrity for Users, Complaints, History Audit, Notifications, and Feedback.
- **`routes/`**: Centralized routing system mounted under `/api` with an automated `/api/health` probe.

---

## 📁 2. Folder Structure

```text
backend/
├── config/
│   ├── database.js          # Mongoose database connection manager & listeners
│   └── cloudinary.js        # Cloudinary CDN credentials configuration
│
├── controllers/             # Future controllers for auth, complaints, and workers
│
├── models/
│   ├── User.js              # Citizen, Municipal Admin, and Field Worker schema
│   ├── Complaint.js         # Geo-tagged complaint model with category & status
│   ├── ComplaintHistory.js  # Immutable chronological audit trail of status changes
│   ├── Notification.js      # Alert dispatch documents
│   └── Feedback.js          # Post-resolution 5-star citizen satisfaction rating
│
├── routes/
│   ├── healthRoutes.js      # GET /api/health probe
│   └── index.js             # Central API router mounted at /api
│
├── middleware/
│   ├── errorMiddleware.js   # Centralized error handler (hides stacks in production)
│   ├── notFoundMiddleware.js# 404 handler for undefined endpoints
│   └── requestLogger.js     # Morgan HTTP access logger with ISO timestamps
│
├── services/                # External microservices (Cloudinary, Notification dispatch)
│
├── utils/
│   ├── ApiError.js          # Custom operational error class with status codes
│   └── asyncHandler.js      # Route promise wrapper eliminating try/catch blocks
│
├── tests/
│   ├── health.test.js       # Supertest test suite for Express routes & 404s
│   └── database.test.js     # Mongoose schema validation & ID generation tests
│
├── app.js                   # Express application setup
├── server.js                # Database connection & HTTP startup
├── .env.example             # Documented template for environment variables
├── package.json             # NPM dependencies & test scripts
└── README.md                # Backend documentation
```

---

## 🛠️ 3. Technology Stack

- **Node.js**: Modern JavaScript runtime (v18.0+)
- **Express.js (v4.21+)**: High-performance HTTP web application framework
- **MongoDB Atlas / Mongoose (v8.7+)**: Object Data Modeling (ODM) library
- **Helmet**: Secures HTTP response headers
- **CORS**: Strict domain origin validation for React frontend (`http://localhost:5173`)
- **express-rate-limit**: DDoS and brute-force protection
- **morgan**: HTTP request access logging
- **Jest & Supertest**: Automated unit and integration testing

---

## ⚙️ 4. Environment Variables Configuration

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
| `JWT_SECRET` | *(Random secret)* | Secret key used for signing JWT tokens in Phase 4 |
| `JWT_EXPIRE` | `7d` | Token expiry duration |
| `CLOUDINARY_*` | *(Empty)* | Cloudinary credentials for photo uploads (Phase 5) |

---

## 🍃 5. MongoDB Setup Guide

### Option A: Free Cloud MongoDB Atlas (Recommended for Cloud / DevOps)
1. Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free shared cluster (e.g. `M0 Sandbox`).
3. Under **Database Access**, create a database user (e.g., `civic_admin`) with a secure password.
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere (`0.0.0.0/0`)** for cloud development.
5. In your cluster dashboard, click **Connect** → **Drivers (Node.js)**.
6. Copy the connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/civicconnect?retryWrites=true&w=majority
   ```
7. Paste this into `backend/.env` as `MONGODB_URI`.

### Option B: Local MongoDB (Offline Development)
If you have MongoDB Community Edition or Docker running locally:
```text
MONGODB_URI=mongodb://127.0.0.1:27017/civicconnect
```

---

## 🚀 6. Running the Server

### Development Mode (with auto-restart via nodemon)
```powershell
cd backend
npm run dev
```

### Production Mode
```powershell
cd backend
npm start
```

### Expected Output
```text
[CivicConnect Server] Initializing MongoDB connection...
[CivicConnect DB] Connected to MongoDB: cluster0.../civicconnect
------------------------------------------------------------
🏛️  CivicConnect API Server running on port 5000
🌐  Environment : development
🩺  Health Check: http://localhost:5000/api/health
------------------------------------------------------------
```

---

## 🩺 7. Health Check API

### `GET /api/health`
Endpoint to verify that both the server process and the database are healthy.

#### Example Response (HTTP 200 OK):
```json
{
  "success": true,
  "message": "CivicConnect API is running",
  "server": "healthy",
  "database": "connected",
  "timestamp": "2026-11-07T12:00:00.000Z",
  "application": "CivicConnect",
  "environment": "development",
  "uptimeSeconds": 42
}
```

#### If Database is Disconnected (HTTP 503 Service Unavailable):
```json
{
  "success": true,
  "message": "CivicConnect API is running",
  "server": "healthy",
  "database": "disconnected",
  "warning": "Database is currently disconnected. Background retry in progress.",
  "timestamp": "2026-11-07T12:00:00.000Z",
  "application": "CivicConnect"
}
```

---

## 🧪 8. Automated Testing

Run the automated test suite with Jest:

```powershell
cd backend
npm test
```

Tests verify:
- Server initialization & routing
- Security headers (Helmet)
- Health check payload formatting
- 404 handler for unknown routes
- Mongoose schema field validation (User, Complaint, Feedback)
- Static complaint ID generation (`CC-YYYY-XXXX`)
