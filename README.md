# 🚀 Career Intelligence Platform (CIP)

> AI-Powered Interview Preparation & Job Matching System

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-teal)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Team](#team)

---

## 🎯 Overview

**Career Intelligence Platform (CIP)** is an AI-powered system that helps students and professionals prepare for technical interviews, validate certificates, and find matching job opportunities. The platform uses advanced AI (Google Gemini) for real-time interview coaching, OCR for certificate validation, and intelligent algorithms for job matching.

### 🎥 Demo Video
[Watch Demo](https://your-demo-link.com)

### 🌐 Live Demo
[Try it now](https://your-live-demo.com)

---

## ✨ Key Features

### 🎤 AI Interview Coach
- **Real-time Voice Interviews**: Conduct technical, HR, and behavioral interviews with AI
- **5 Pre-Interview Instructions**: Voice-guided tips before each interview
- **Live Feedback**: Get instant AI feedback on your answers
- **Multiple Interview Modes**:
  - Company-Specific (Google, Amazon, Microsoft, etc.)
  - Role-Based (Frontend, Backend, Full Stack, etc.)
  - Branch-Based (CSE, Mechanical, Civil, etc.)
  - Resume-Based (Personalized questions)
- **Real-time Analytics**: Track confidence, eye contact, voice clarity, emotion
- **250+ Real Questions**: Curated from top companies

### 📄 Smart Resume Analysis
- **PDF/DOCX Support**: Upload and parse resumes automatically
- **Skill Extraction**: AI extracts skills, experience, education
- **Resume Scoring**: Get a score out of 100 with improvement suggestions
- **Personalized Questions**: Interview questions based on your resume

### 🎓 Certificate Validation
- **OCR-Based Verification**: Validate certificates using PaddleOCR & Tesseract
- **390+ Institution Registry**: Support for IITs, IIMs, IEEE, ACM, EdTech platforms
- **Authenticity Score**: 0-100 confidence rating
- **QR Code Detection**: Extract and verify QR codes from certificates
- **Tamper Detection**: Identify fake or modified certificates

### 💼 Intelligent Job Matching
- **100+ Real Jobs**: From Google, Microsoft, Amazon, Flipkart, etc.
- **AI-Powered Matching**: Based on skills, interview performance, readiness score
- **Match Algorithm**: `(Skill Match × 50%) + (Interview Performance × 30%) - (Gap Penalty × 20%)`
- **Personalized Recommendations**: Jobs tailored to your profile
- **Direct Application Links**: Apply directly to company career pages

### 📊 Career Analytics
- **Readiness Score**: Overall career readiness out of 100
- **Skill Gap Analysis**: Identify weak areas and get improvement tips
- **Progress Tracking**: Monitor your improvement over time
- **Performance Insights**: Detailed analytics on interview performance

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                    (Next.js 14 - React 18)                       │
│  • Dashboard  • Interview  • Jobs  • Profile  • Analytics       │
└─────────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Port 8080)                     │
│                   Spring Boot 3.2 - Java 17                      │
│  • Authentication (JWT)  • Authorization  • Rate Limiting        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────────┐            ┌──────────────────────┐
│   BACKEND SERVICES   │            │     ML SERVICE       │
│   (Spring Boot)      │            │     (FastAPI)        │
│   Port: 8080         │←──────────→│   Port: 8000         │
│                      │   HTTP     │                      │
│ • Interview V3       │            │ • Gemini AI          │
│ • Resume Parser      │            │ • Resume Analysis    │
│ • Certificate        │            │ • Interview Eval     │
│ • Job Matching       │            │ • Certificate OCR    │
│ • Analytics          │            │ • Career Readiness   │
└──────────────────────┘            └──────────────────────┘
        ↓                                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
│  • Users  • Interviews  • Certificates  • Jobs  • Analytics     │
└─────────────────────────────────────────────────────────────────┘
```

**For detailed architecture, see [ARCHITECTURE.md](ARCHITECTURE.md)**

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: Spring Boot 3.2
- **Language**: Java 17
- **Database**: PostgreSQL 14+
- **ORM**: Hibernate/JPA
- **Security**: JWT Authentication
- **Migrations**: Flyway
- **Build Tool**: Maven

### ML Service
- **Framework**: FastAPI
- **Language**: Python 3.10+
- **AI Model**: Google Gemini AI
- **OCR**: PaddleOCR (primary), Tesseract (fallback)
- **PDF Processing**: PyMuPDF, pdf2image
- **Image Processing**: OpenCV, Pillow
- **ML Libraries**: scikit-learn, numpy

### DevOps
- **Version Control**: Git
- **CI/CD**: GitHub Actions (planned)
- **Deployment**: AWS (planned)
- **Monitoring**: Actuator (Spring Boot)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- Python 3.10+
- PostgreSQL 14+
- Maven 3.8+

### 1. Clone Repository
```bash
git clone https://github.com/your-username/career-intelligence-platform.git
cd career-intelligence-platform
```

### 2. Database Setup
```sql
-- Create database
CREATE DATABASE career_intelligence;

-- Create user (optional)
CREATE USER cip_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE career_intelligence TO cip_user;
```

### 3. Backend Setup
```bash
cd cip-backend-lite

# Update application.yml with your database credentials
# src/main/resources/application.yml

# Run backend
mvn spring-boot:run
```

Backend will start on `http://localhost:8080`

### 4. ML Service Setup
```bash
cd cip-ml

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "ANTHROPIC_API_KEY=your_anthropic_api_key" > .env

# Run ML service
python main.py
```

ML Service will start on `http://localhost:8000`

### 5. Frontend Setup
```bash
cd cip-web

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
echo "NEXT_PUBLIC_ML_URL=http://localhost:8000" >> .env.local

# Run frontend
npm run dev
```

Frontend will start on `http://localhost:3000`

### 6. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **ML Service**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📁 Project Structure

```
career-intelligence-platform/
├── cip-web/                    # Frontend (Next.js)
│   ├── app/                    # App router pages
│   │   ├── (app)/             # Authenticated pages
│   │   │   ├── dashboard/     # Dashboard
│   │   │   ├── interview/     # Interview pages
│   │   │   ├── jobs/          # Job listings
│   │   │   ├── profile/       # User profile
│   │   │   └── analytics/     # Analytics
│   │   └── auth/              # Authentication pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities & API client
│   └── store/                 # Zustand store
│
├── cip-backend-lite/          # Backend (Spring Boot)
│   └── src/main/java/com/cip/
│       ├── auth/              # Authentication
│       ├── interview/         # Interview V3 system
│       ├── certificate/       # Certificate validation
│       ├── analytics/         # Analytics service
│       ├── common/            # Common utilities
│       └── config/            # Configuration
│
├── cip-ml/                    # ML Service (FastAPI)
│   ├── main.py               # FastAPI app
│   ├── services/             # ML services
│   │   ├── gemini_service.py # Gemini AI integration
│   │   ├── ocr_service.py    # OCR processing
│   │   └── resume_service.py # Resume analysis
│   └── models/               # Data models
│
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md       # System architecture
│   ├── API.md                # API documentation
│   └── DEPLOYMENT.md         # Deployment guide
│
└── README.md                 # This file
```

---

## 📚 API Documentation

### Authentication
```bash
# Register
POST /auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Test@123",
  "role": "STUDENT"
}

# Login
POST /auth/login
{
  "email": "john@example.com",
  "password": "Test@123"
}
```

### Interview
```bash
# Get interview configuration
GET /interview/v3/config

# Get pre-interview tips
GET /interview/v3/tips?roundType=TECHNICAL&difficulty=MEDIUM&duration=30

# Start interview
POST /interview/v3/start
{
  "interviewMode": "COMPANY_SPECIFIC",
  "company": "Google",
  "roundType": "TECHNICAL",
  "duration": 30,
  "difficulty": "MEDIUM"
}

# Submit answer
POST /interview/v3/answer
{
  "interviewId": 1,
  "questionIndex": 0,
  "answer": "Your answer here",
  "timeTaken": 120
}
```

### Jobs
```bash
# Get recommended jobs
GET /jobs/recommended

# Filter jobs
GET /jobs/filter?type=INTERNSHIP&location=Bengaluru&experience=FRESHER
```

**For complete API documentation, see [docs/API.md](docs/API.md)**

---

## 🎨 Features in Detail

### Interview System Flow
```
1. User selects interview configuration
   ↓
2. Pre-interview instructions (voice-guided)
   ↓
3. Interview starts with AI questions
   ↓
4. User answers via voice/text
   ↓
5. AI evaluates and provides feedback
   ↓
6. Real-time analytics tracking
   ↓
7. Interview report with detailed analysis
```

### Certificate Validation Flow
```
1. User uploads certificate (PDF/Image)
   ↓
2. PDF converted to images
   ↓
3. OCR extraction (PaddleOCR + Tesseract)
   ↓
4. Text analysis & issuer matching
   ↓
5. QR code detection & verification
   ↓
6. Tamper detection algorithms
   ↓
7. Authenticity score (0-100)
```

### Job Matching Algorithm
```
Match Score = (Skill Match × 50%) + (Interview Performance × 30%) - (Gap Penalty × 20%)

Where:
- Skill Match: Overlap between user skills and job requirements
- Interview Performance: Latest interview score
- Gap Penalty: Weak areas matching job critical skills
```

---

## 🧪 Testing

### Backend Tests
```bash
cd cip-backend-lite
mvn test
```

### Frontend Tests
```bash
cd cip-web
npm test
```

### ML Service Tests
```bash
cd cip-ml
pytest
```

---

## 📊 Database Schema

### Key Tables
- **users**: User accounts and profiles
- **interviews**: Interview sessions
- **interview_responses**: Individual answers
- **certificates**: Certificate uploads
- **certificate_results**: Validation results
- **jobs**: Job listings
- **company_questions**: Company-specific questions
- **branch_questions**: Branch-specific questions
- **facial_analytics**: Real-time analytics data

**For complete schema, see [docs/DATABASE.md](docs/DATABASE.md)**

---

## 🚀 Deployment

### AWS Deployment (Recommended)
- **Frontend**: AWS Amplify / Vercel
- **Backend**: AWS Elastic Beanstalk / ECS
- **ML Service**: AWS ECS (GPU instance)
- **Database**: AWS RDS PostgreSQL
- **Storage**: AWS S3

**For deployment guide, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- **Frontend**: ESLint + Prettier
- **Backend**: Google Java Style Guide
- **ML Service**: PEP 8

---

## 👥 Team

- **[Your Name]** - Full Stack Developer
- **[Team Member 2]** - Backend Developer
- **[Team Member 3]** - ML Engineer
- **[Team Member 4]** - Frontend Developer

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Google Gemini AI for interview evaluation
- PaddleOCR for certificate OCR
- Spring Boot & FastAPI communities
- Next.js team for amazing framework

---

## 📞 Support

For support, email support@cip-platform.com or join our [Discord](https://discord.gg/your-invite).

---

## 🗺️ Roadmap

### Q2 2026
- [ ] Mobile app (React Native)
- [ ] Video interview recording
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

### Q3 2026
- [ ] Group discussion feature
- [ ] Peer-to-peer mock interviews
- [ ] Company-specific preparation tracks
- [ ] Integration with LinkedIn

### Q4 2026
- [ ] AI resume builder
- [ ] Salary negotiation coach
- [ ] Career path recommendations
- [ ] Enterprise version

---

## 📈 Stats

- **250+** Interview Questions
- **390+** Certificate Institutions
- **100+** Real Job Listings
- **14** Supported Companies
- **7** Engineering Branches
- **11** Job Roles

---

**Made with ❤️ by the CIP Team**

[⬆ Back to top](#-career-intelligence-platform-cip)
