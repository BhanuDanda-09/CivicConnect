# Smart Civic Complaint Management System with DevOps 🚀

> **A real-world civic-tech platform for citizens, municipal administrators, and field workers with full-scale automated CI/CD pipelines, containerization, Kubernetes orchestration, and real-time monitoring.**

---

## 🏛️ 1. Project Overview

The **Smart Civic Complaint Management System** is a modern, responsive, and robust full-stack civic-tech solution designed to bridge the gap between citizens and local civic administration. Citizens can submit geo-tagged complaints with photo proof for issues such as road potholes, garbage accumulation, sewage overflows, water leakage, and broken streetlights. Municipal administrators can verify, prioritize, and assign these tasks to municipal workers, who update progress and resolve issues with before/after photo evidence.

In addition to full-stack application development, this project implements a complete **DevOps lifecycle**:
- **Containerization**: Docker & Docker Compose
- **Continuous Integration & Delivery**: Jenkins & GitHub Actions
- **Container Orchestration**: Kubernetes (Deployments, Services, ConfigMaps, Ingress, HPA)
- **Monitoring & Metrics**: Prometheus & Grafana
- **Centralized Logging**: Structured logging & ELK Stack integration
- **Cloud Infrastructure**: AWS EC2 & MongoDB Atlas

---

## 🏗️ 2. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Leaflet & OpenStreetMap, Lucide Icons |
| **Backend** | Node.js, Express.js, MongoDB Atlas / Mongoose, JWT, bcryptjs, Multer, Cloudinary, Prom-client, Winston |
| **DevOps & Containers** | Docker, Docker Compose, Docker Hub |
| **CI / CD** | Jenkins Pipeline (`Jenkinsfile`), GitHub Actions (`.github/workflows/ci.yml`) |
| **Orchestration** | Kubernetes (`k8s/` manifests for deployments, services, ingress) |
| **Monitoring & Logs** | Prometheus, Grafana, Winston structured logging, ELK Stack (Elasticsearch, Logstash, Kibana) |
| **Cloud Hosting** | AWS EC2 (Ubuntu), Managed MongoDB Atlas |

---

## 📁 3. Project Folder Structure

```
Smart Civic Complaint Management System/
│
├── frontend/                               # React 18 + Vite frontend SPA
│   ├── public/                             # Public static assets (favicon, manifest)
│   ├── src/
│   │   ├── assets/                         # Static images, logos, icons
│   │   ├── components/                     # Reusable UI components (Navbar, Modal, Card, Table)
│   │   ├── pages/                          # Application pages (Citizen, Admin, Worker, Auth)
│   │   ├── layouts/                        # Layout wrappers (CitizenLayout, AdminLayout, AuthLayout)
│   │   ├── context/                        # React Context providers (AuthContext, Socket/Notif)
│   │   ├── services/                       # Axios API client services (auth, complaints, users)
│   │   ├── hooks/                          # Custom reusable React hooks (useAuth, useLocation)
│   │   ├── utils/                          # Formatting, date helpers, status badges
│   │   ├── App.jsx                         # Main client routing definitions
│   │   └── main.jsx                        # React root entry point
│   ├── Dockerfile                          # Multi-stage production build (Node -> Nginx)
│   ├── nginx.conf                          # Custom Nginx reverse proxy / SPA router configuration
│   └── package.json                        # Frontend dependencies and npm scripts
│
├── backend/                                # Node.js + Express REST API server
│   ├── config/                             # Database, Cloudinary, and server configuration
│   ├── controllers/                        # Business logic handlers (auth, complaints, workers)
│   ├── models/                             # Mongoose schemas (User, Complaint, History, Feedback)
│   ├── routes/                             # Express REST API route endpoints
│   ├── middleware/                         # JWT auth, RBAC authorization, error handling, upload
│   ├── services/                           # Cloudinary service, notification service, metrics
│   ├── utils/                              # Custom error classes, validators, token utilities
│   ├── tests/                              # Automated unit and integration tests (Jest / Supertest)
│   ├── server.js                           # Express application entrypoint
│   ├── Dockerfile                          # Containerfile for backend Node.js runtime
│   └── package.json                        # Backend dependencies and scripts
│
├── docker-compose.yml                      # Local multi-container development orchestration
├── Jenkinsfile                             # 11-stage automated CI/CD Jenkins pipeline
├── .dockerignore                           # Excluded files during Docker image building
├── .gitignore                              # Git exclusion rules (node_modules, .env, logs)
├── .env.example                            # Documented template of environment variables
│
├── k8s/                                    # Production Kubernetes manifests
│   ├── configmap.yaml                      # Non-sensitive application configurations
│   ├── secrets.example.yaml                # Example Kubernetes secret template
│   ├── backend-deployment.yaml             # Backend Pod deployment with liveness/readiness probes
│   ├── backend-service.yaml                # ClusterIP service routing to backend pods
│   ├── frontend-deployment.yaml            # Frontend Nginx Pod deployment
│   ├── frontend-service.yaml               # ClusterIP / NodePort service for frontend
│   └── ingress.yaml                        # NGINX Ingress Controller routing rules
│
├── monitoring/                             # Observability and metrics stack
│   ├── prometheus.yml                      # Prometheus scraper configuration
│   └── grafana/                            # Grafana provisioning and dashboard definitions
│       ├── provisioning/
│       │   ├── datasources/                # Automated Prometheus datasource link
│       │   └── dashboards/                 # Automated dashboard provisioning
│       └── dashboards/                     # Pre-configured metrics visualization JSONs
│
├── .github/
│   └── workflows/
│       └── ci.yml                          # GitHub Actions automated linting and test workflow
│
└── README.md                               # Complete project documentation
```

---

## 👥 4. User Roles & Status Lifecycle

### User Roles
1. **Citizen**: Registers, logs in, files complaints with GPS location and photo, tracks status, views resolution details, and provides post-resolution feedback.
2. **Administrator**: Oversees all city complaints, filters by category/ward/urgency, verifies validity, rejects spam, assigns complaints to municipal workers, and tracks department analytics.
3. **Municipal Worker**: Views assigned tasks, inspects location on map, marks task as in progress, uploads work-in-progress and resolution photographs, and marks work as completed.

### Complaint Lifecycle
```
[SUBMITTED] ──(Admin verifies)──> [UNDER_VERIFICATION] ──> [VERIFIED]
     │                                                         │
     └──(If spam/duplicate)──> [REJECTED]                      └──(Admin assigns)
                                                                    │
                                                                    ▼
[CITIZEN_FEEDBACK] <──(Worker finishes)── [RESOLVED] <── [IN_PROGRESS] <── [ASSIGNED]
```

---

## 🛠️ 5. Software Prerequisites

To run and develop this project locally on Windows:
1. **Node.js**: v18 or higher (v24+ recommended)
2. **npm**: v9 or higher (v11+ recommended)
3. **Git**: Version Control CLI
4. **Docker Desktop for Windows**: With WSL 2 backend enabled
5. **MongoDB**: Local MongoDB Community Edition or free MongoDB Atlas cloud cluster
6. **Code Editor**: Visual Studio Code / Antigravity

---

## 📋 6. 15-Phase Development Roadmap

- [x] **Phase 1: Project initialization and folder structure** *(Completed)*
- [x] **Phase 2: Frontend setup and UI development** *(Completed)*
- [x] **Phase 3: Backend setup and MongoDB connection** *(Completed)*
- [x] **Phase 4: Authentication and role-based access control (RBAC)** *(Completed)*
- [x] **Phase 5: Complaint management functionality** *(Completed)*
- [ ] **Phase 6: Admin and worker dashboards**
- [ ] **Phase 7: Frontend-backend integration**
- [ ] **Phase 8: Testing and bug fixing**
- [ ] **Phase 9: Docker and Docker Compose**
- [ ] **Phase 10: GitHub Actions and Jenkins CI/CD**
- [ ] **Phase 11: Kubernetes deployment**
- [ ] **Phase 12: AWS deployment**
- [ ] **Phase 13: Prometheus and Grafana monitoring**
- [ ] **Phase 14: Centralized logging and failure recovery**
- [ ] **Phase 15: Final testing and documentation**
