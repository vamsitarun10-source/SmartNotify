<div align="center">

# SmartNotify

**AI-powered student productivity and class management application**

[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.0_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

SmartNotify is a full-stack mobile application that combines AI-powered natural language scheduling with comprehensive student productivity tools. Built with React Native and FastAPI, it uses Google Gemini for intelligent intent classification and MongoDB for data persistence. Students can manage classes, track attendance, stay on top of assignments and exams, and control everything through a conversational AI assistant — all with offline support and a Material Design interface.

---

## Features

### AI Assistant
- Natural language event creation, deletion, and modification
- Attendance queries with per-subject breakdown
- Timetable and next-class queries
- Assignment and exam queries
- Reminder management
- Study statistics and productivity dashboard
- Rewards and XP queries
- Intelligent intent classification (14 intents via Gemini + fallback
- Greetings and unknown messages never create events

### Class Management
- Create, edit, and delete classes
- Calendar view with color-coded events
- Weekly timetable with recurring entries
- Timetable auto-generation (4-week schedule)
- Attendance marking per class
- Local notifications for class reminders

### Productivity
- Tasks with priority levels, categories, and due dates
- Assignment tracker with overdue detection
- Exam planner with countdown timers
- Notes with text, image, PDF, and voice types
- Subject-based organization and full-text search
- Rewards system with XP, levels, streaks, and badges
- Statistics dashboard with charts
- Global search across all data

### User Experience
- Dark mode, light mode, and AMOLED theme
- Offline-first architecture with sync queue
- Responsive layout with safe area support
- Material Design 3 inspired components
- Smooth animated transitions
- Keyboard-aware input handling
- Accessibility labels and touch targets

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React Native 0.86 | Cross-platform mobile framework |
| | TypeScript 5.8 | Type-safe development |
| | React Navigation 7 | Screen and tab navigation |
| | AsyncStorage | Local data persistence |
| | Notifee | Rich local notifications |
| | Axios | HTTP client |
| | NetInfo | Network connectivity detection |
| **Backend** | FastAPI 0.115 | Async Python web framework |
| | PyMongo 4.13 | MongoDB driver |
| | Pydantic 2.11 | Data validation |
| | python-jose | JWT authentication |
| | bcrypt | Password hashing |
| **Database** | MongoDB 7.x | NoSQL document store |
| **AI** | Google Gemini 2.0 Flash | Natural language intent classification |
| **DevOps** | Hermes | Optimized JavaScript engine |
| | Metro | JavaScript bundler |
| | ProGuard | Code minification |

---

## Architecture

```
┌─────────────────────┐
│   Mobile App        │
│   (React Native)    │
│                     │
│  ┌───────────────┐  │
│  │  React Hooks  │  │
│  │  + Context    │  │
│  └───────┬───────┘  │
│          │          │
│  ┌───────▼───────┐  │
│  │  API Layer    │  │
│  │  (Axios)      │  │
│  └───────┬───────┘  │
│          │          │
│  ┌───────▼───────┐  │
│  │  Offline Sync │  │
│  │  Queue + Cache│  │
│  └───────────────┘  │
└─────────┬───────────┘
          │ HTTP / REST
┌─────────▼───────────┐
│   FastAPI Backend   │
│                     │
│  ┌───────────────┐  │
│  │  JWT Auth     │  │
│  └───────┬───────┘  │
│  ┌───────▼───────┐  │
│  │  Route        │  │
│  │  Handlers     │  │
│  └───────┬───────┘  │
│  ┌───────▼───────┐  │
│  │  Gemini AI    │  │
│  │  Classifier   │  │
│  └───────────────┘  │
└─────────┬───────────┘
          │ PyMongo
┌─────────▼───────────┐
│     MongoDB         │
│  (9 Collections)    │
└─────────────────────┘
```

---

## Screens

| Screen | Description |
|--------|-------------|
| **Home** | Smart dashboard with reorderable widgets |
| **Calendar** | Monthly grid with color-coded class/assignment/exam dots |
| **AI Assistant** | Conversational chat with AI for natural language scheduling |
| **Attendance** | Per-subject attendance tracking with color indicators |
| **Statistics** | Charts for attendance, productivity, study hours |
| **Rewards** | XP, levels, streaks, achievements, and badges |
| **Tasks** | Daily planner with priority levels and categories |
| **Assignments** | Homework tracker with overdue detection |
| **Exams** | Exam planner with countdown timers |
| **Timetable** | Weekly recurring timetable with auto-generation |
| **Notes** | Subject-organized notes with text, image, PDF, voice |
| **Settings** | Theme toggle, font scaling, app preferences |

> Screenshots coming soon.

---

## Project Structure

```
ClassReminder/                  # React Native mobile app
├── app/                        # Screen components (27 screens)
│   ├── Home.tsx                # Smart dashboard with widgets
│   ├── Login.tsx               # Authentication
│   ├── Register.tsx            # User registration
│   ├── Calendar.tsx            # Monthly calendar view
│   ├── AI Assistant            # (integrated in Home.tsx)
│   ├── Tasks.tsx               # Daily planner
│   ├── Assignments.tsx         # Assignment tracker
│   ├── Exams.tsx               # Exam planner
│   ├── Attendance.tsx          # Attendance tracking
│   ├── Timetable.tsx           # Recurring timetable
│   ├── Statistics.tsx          # Charts and analytics
│   ├── Notes.tsx               # Note manager
│   ├── Rewards.tsx             # Gamification
│   └── Settings.tsx            # App configuration
├── components/                 # Reusable UI components (21 total)
│   ├── EventCard.tsx           # Class event card
│   ├── DashboardCard.tsx       # Animated dashboard card
│   └── widgets/                # 12 dashboard widgets
├── hooks/                      # Custom React hooks (15 total)
├── services/                   # API and notification services
├── constants/                  # Theme, settings, configuration
├── utils/                      # Date and formatting utilities
└── navigation/                 # Navigation configuration

backend/                        # FastAPI Python backend
├── routes/                     # API route modules (14 modules)
├── models/                     # Pydantic data models
├── services/                   # Gemini AI service
└── utils/                      # Auth, validation, helpers
```

---

## Installation

### Prerequisites

- Node.js 22.11+
- Python 3.11+
- Android Studio (for Android development)
- MongoDB (local or Atlas)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
# Windows: venv\Scripts\activate
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Gemini API key

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd ClassReminder

# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on Android (in another terminal)
npm run android
```

### Environment Variables

```env
MONGO_URI=mongodb+srv://your-connection-string
DATABASE_NAME=classreminder
JWT_SECRET_KEY=your-super-secret-key
GEMINI_API_KEY=your-google-gemini-api-key
```

---

## API Overview

| Module | Key Endpoints |
|--------|--------------|
| **Auth** | `POST /auth/register`, `POST /auth/login` |
| **Events** | `GET/POST /events`, `PUT/DELETE /events/{id}`, `PUT /events/{id}/attendance` |
| **AI Chat** | `POST /ai/chat` — natural language event management |
| **Timetable** | `GET/POST /timetable`, `POST /timetable/generate` |
| **Tasks** | `GET/POST /tasks`, `PUT /tasks/{id}/toggle` |
| **Assignments** | `GET/POST /assignments`, `GET /assignments/upcoming` |
| **Exams** | `GET/POST /exams`, `GET /exams/upcoming` |
| **Notes** | `GET/POST /notes`, `GET /notes/subjects` |
| **Stats** | `GET /stats/dashboard` — aggregated analytics |
| **Search** | `GET /search/?q=` — global search |
| **Backup** | `GET /backup/export`, `POST /backup/import` |
| **Rewards** | `GET /rewards`, `POST /rewards/add-xp` |

---

## Future Improvements

- Cloud deployment (Render / Railway)
- Push notifications via FCM
- OCR timetable import from images
- Voice command support
- Multi-device sync via cloud
- Study planner with Pomodoro timer
- GPA calculator
- Google Calendar integration
- Apple Watch / Wear OS companion
- Multi-language i18n support

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

Please follow the existing code style and add tests for new features.

---

## Repository

GitHub Repository: https://github.com/vamsitarun10-source/SmartNotify

---

## Author

**Vamsi Krishna**

Electronics and Communication Engineering (ECE) Student

Aspiring AI Engineer | Full-Stack Developer | Mobile App Developer

Passionate about Artificial Intelligence, Mobile App Development, Backend Development, and building real-world software solutions.

- GitHub: https://github.com/vamsitarun10-source
- LinkedIn: https://www.linkedin.com/in/vamsi-krishna-09360038b/

---

<div align="center">

**Built with React Native · FastAPI · MongoDB · Gemini AI**

</div>
