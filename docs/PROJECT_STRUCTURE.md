# 📁 Career Intelligence Platform - Project Structure

## 🏗️ Architecture Overview

This is a **microservices-based** application with:
- **10 Backend Microservices** (Java Spring Boot)
- **1 ML Service** (Python FastAPI)
- **1 Frontend** (Next.js React)
- **PostgreSQL** Database
- **Redis** (optional) for caching

---

## 📂 Project Structure

```
cip-backend-lite/
│
├── cip-backend/                    # Java Spring Boot Microservices
│   ├── api-gateway/                # Main API Gateway (Port 8080)
│   ├── auth-service/               # Authentication & JWT (Port 8081)
│   ├── student-service/            # Student profiles (Port 8082)
│   ├── interview-service/          # Interview management (Port 8083)
│   ├── resume-service/             # Resume parsing (Port 8084)
│   ├── certificate-service/        # Certificate validation (Port 8085)
│   ├── job-service/                # Job listings (Port 8086)
│   ├── recommendation-service/     # Job recommendations (Port 8087)
│   ├── score-service/              # Career scoring (Port 8088)
│   ├── analytics-service/          # Analytics (Port 8089)
│   ├── common-lib/                 # Shared utilities
│   ├── infra/                      # Infrastructure scripts
│   ├── pom.xml                     # Parent Maven POM
│   └── docker-compose.yml          # Local development
│
├── cip-ml/                         # Python ML Service (Port 8000)
│   ├── services/
│   │   ├── career_readiness/       # Career readiness engine
│   │   ├── certificate_validator/  # OCR & validation
│   │   └── interview_evaluator/    # Interview AI evaluation
│   ├── kafka/                      # Kafka consumers
│   ├── main.py                     # FastAPI application
│   ├── requirements.txt            # Python dependencies
│   └── Dockerfile                  # Docker image
│
├── cip-web/                        # Next.js Frontend (Port 3000)
│   ├── app/                        # Next.js App Router
│   │   ├── (app)/                  # Authenticated pages
│   │   │   ├── dashboard/          # Dashboard
│   │   │   ├── interview/          # Interview pages
│   │   │   ├── jobs/               # Job listings
│   │   │   ├── profile/            # User profile
│   │   │   └── analytics/          # Analytics
│   │   └── auth/                   # Auth pages (login/signup)
│   ├── components/                 # React components
│   ├── lib/                        # API client & utilities
│   ├── store/                      # Zustand state management
│   ├── package.json                # NPM dependencies
│   └── Dockerfile                  # Docker image (to be created)
│
├── database/                       # SQL Scripts
│   ├── create_dbs.sql              # Database initialization
│   ├── seed_real_jobs.sql          # Job data seeding
│   ├── demo_queries.sql            # Example queries
│   ├── commends.sql                # Common commands
│   └── show_questions_commands.sql # Question queries
│
├── docs/                           # Documentation
│   ├── API.md                      # API documentation
│   ├── CERTIFICATE_VALIDATOR.md    # Certificate validation guide
│   ├── INTERVIEW_SYSTEM.md         # Interview system docs
│   ├── JOB_MATCHING_SYSTEM.md      # Job matching algorithm
│   ├── ML_SERVICE.md               # ML service documentation
│   └── TECHNOLOGY_STACK.md         # Tech stack details
│
├── storage/                        # File storage (runtime)
│   └── certificates/               # Uploaded certificates
│
├── uploads/                        # File uploads (runtime)
│   └── [user_id]/                  # User-specific uploads
│
├── ARCHITECTURE.md                 # System architecture
├── README.md                       # Main README
├── start_all.bat                   # Start all services (Windows)
└── stop_all.bat                    # Stop all services (Windows)
```

---

## 🚀 Technology Stack

### Backend (Java)
- **Framework**: Spring Boot 3.2
- **Language**: Java 17
- **Build Tool**: Maven 3.9+
- **Database**: PostgreSQL 14+
- **Messaging**: Kafka (optional)
- **Cache**: Redis (optional)

### ML Service (Python)
- **Framework**: FastAPI
- **Language**: Python 3.10+
- **AI**: Google Gemini AI
- **OCR**: PaddleOCR, Tesseract
- **PDF**: PyMuPDF, pdf2image

### Frontend (TypeScript)
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State**: Zustand
- **HTTP**: Axios

---

## 🔌 Service Communication

```
Client (Browser)
    ↓
API Gateway (8080)
    ↓
    ├─→ Auth Service (8081)
    ├─→ Student Service (8082)
    ├─→ Interview Service (8083)
    ├─→ Resume Service (8084)
    ├─→ Certificate Service (8085) ←→ ML Service (8000)
    ├─→ Job Service (8086)
    ├─→ Recommendation Service (8087)
    ├─→ Score Service (8088)
    └─→ Analytics Service (8089)
```

---

## 🗄️ Database Schema

### Main Database: `career_intelligence`

**Tables:**
- `users` - User accounts
- `student_profiles` - Student information
- `interviews` - Interview sessions
- `interview_responses` - Interview answers
- `resumes` - Uploaded resumes
- `certificates` - Certificate uploads
- `certificate_results` - Validation results
- `jobs` - Job listings
- `recommendations` - Job recommendations
- `scores` - Career readiness scores
- `analytics` - Usage analytics

---

## 📦 Docker Deployment

### Build Images:
```bash
# Backend services
cd cip-backend
mvn clean package
docker-compose build

# ML Service
cd cip-ml
docker build -t cip-ml:latest .

# Frontend
cd cip-web
docker build -t cip-web:latest .
```

### Run with Docker Compose:
```bash
cd cip-backend
docker-compose up -d
```

---

## ☸️ Kubernetes Deployment

### Services Required:
1. PostgreSQL (StatefulSet or RDS)
2. Redis (StatefulSet or ElastiCache) - optional
3. 10 Backend Services (Deployments)
4. ML Service (Deployment)
5. Frontend (Deployment)
6. Ingress Controller

### Namespaces:
- `backend` - All backend services
- `ml` - ML service
- `frontend` - Frontend app
- `data` - Database & Redis

---

## 🔐 Environment Variables

### Backend Services:
```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/career_intelligence
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<password>
JWT_SECRET=<secret>
REDIS_HOST=redis
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
ML_SERVICE_URL=http://cip-ml:8000
```

### ML Service:
```env
ANTHROPIC_API_KEY=<your_key>
DATABASE_URL=postgresql://postgres:<password>@db:5432/career_intelligence
```

### Frontend:
```env
NEXT_PUBLIC_API_URL=http://api-gateway:8080
NEXT_PUBLIC_ML_URL=http://cip-ml:8000
```

---

## 📝 API Endpoints

### API Gateway: `http://localhost:8080`

**Authentication:**
- `POST /auth/signup` - Register
- `POST /auth/login` - Login
- `GET /auth/me` - Get profile

**Interviews:**
- `GET /interview/v3/config` - Get configuration
- `POST /interview/v3/start` - Start interview
- `POST /interview/v3/answer` - Submit answer
- `GET /interview/v3/result/{id}` - Get results

**Jobs:**
- `GET /jobs/recommended` - Recommended jobs
- `GET /jobs/filter` - Filter jobs

**Certificates:**
- `POST /certificates/upload` - Upload certificate
- `GET /certificates/{id}/result` - Get validation result

**Complete API docs:** `/docs/API.md`

---

## 🧪 Testing

### Local Testing:
```bash
# Start all services
start_all.bat

# Access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8080
# - ML API: http://localhost:8000
```

### Unit Tests:
```bash
# Backend
cd cip-backend
mvn test

# Frontend
cd cip-web
npm test

# ML Service
cd cip-ml
pytest
```

---

## 📚 Documentation

- **Architecture**: `ARCHITECTURE.md` - System design
- **API**: `docs/API.md` - Complete API reference
- **ML Service**: `docs/ML_SERVICE.md` - ML service details
- **Interview System**: `docs/INTERVIEW_SYSTEM.md` - Interview flow
- **Certificate Validation**: `docs/CERTIFICATE_VALIDATOR.md` - OCR details
- **Job Matching**: `docs/JOB_MATCHING_SYSTEM.md` - Matching algorithm

---

## 🤝 Contributing

1. Follow Google Java Style Guide for Java code
2. Follow PEP 8 for Python code
3. Use ESLint + Prettier for TypeScript/React
4. Write tests for new features
5. Update documentation

---

## 📄 License

MIT License - See LICENSE file

---

**Made with ❤️ by the CIP Team**
