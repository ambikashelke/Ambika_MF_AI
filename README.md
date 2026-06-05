# MindForge AI

> **Turn Thoughts into Structured Action** — MindForge AI converts your voice into structured mind maps and actionable task lists instantly.

---

## 📁 Project Structure

```
MindForge-AI/
├── frontend/                  # React + Vite + Tailwind + shadcn/ui
│   ├── src/
│   │   ├── components/        # UI & feature components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── integrations/      # Supabase client integration
│   │   ├── lib/               # Utility functions
│   │   ├── pages/             # Route-level pages
│   │   ├── services/          # API service layer
│   │   └── test/              # Test setup & specs
│   ├── public/                # Static assets
│   ├── index.html             # Entry HTML
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── .env                   # Frontend env vars (Supabase keys, API URL)
│
├── backend/                   # FastAPI (Python)
│   ├── main.py                # App entry-point
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Backend env vars
│   └── app/
│       ├── routes/
│       │   ├── health.py      # GET  /api/health
│       │   ├── mindmap.py     # POST /api/generate-mindmap
│       │   └── tasks.py       # POST /api/generate-tasks
│       ├── services/
│       │   └── ai_service.py  # AI / mock service logic
│       ├── models/
│       │   └── schemas.py     # Pydantic request/response models
│       └── config/
│           └── settings.py    # Env-based configuration
│
├── supabase/                  # Supabase project config
│   ├── functions/
│   ├── migrations/
│   └── config.toml
│
├── start.bat                  # One-click launcher (Windows)
├── .gitignore
└── README.md                  # ← You are here
```

---

## 🚀 Quick Start (Windows)

The easiest way to run everything is with the launcher script:

```bash
start.bat
```

This will:
1. Create a Python virtual environment (if missing)
2. Install backend dependencies
3. Start the FastAPI server on **http://127.0.0.1:8000**
4. Install frontend npm packages (if `node_modules` is missing)
5. Start the Vite dev server on **http://localhost:8080**

---

## 🔧 Manual Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The React app will be available at **http://localhost:8080**.

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS / Linux
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The FastAPI server will be available at **http://127.0.0.1:8000**.

- **Swagger Docs:** http://127.0.0.1:8000/docs
- **Health Check:** http://127.0.0.1:8000/api/health

---

## 🔑 API Endpoints

| Method | Path                     | Description                          |
|--------|--------------------------|--------------------------------------|
| GET    | `/api/health`            | Backend readiness check              |
| POST   | `/api/generate-mindmap`  | Generate a mind map from transcript  |
| POST   | `/api/generate-tasks`    | Generate tasks from mind-map nodes   |

---

## 🌐 Environment Variables

### Frontend (`frontend/.env`)

| Variable                       | Description                |
|--------------------------------|----------------------------|
| `VITE_SUPABASE_PROJECT_ID`     | Supabase project ID        |
| `VITE_SUPABASE_PUBLISHABLE_KEY`| Supabase anon/public key   |
| `VITE_SUPABASE_URL`            | Supabase API URL           |
| `VITE_API_BASE_URL`            | Backend API base URL       |

### Backend (`backend/.env`)

| Variable        | Description                       |
|-----------------|-----------------------------------|
| `APP_ENV`       | Environment (development / prod)  |
| `APP_DEBUG`     | Debug mode toggle                 |
| `FRONTEND_URL`  | Allowed CORS origin for frontend  |

> **Note:** Never commit `.env` files with real secrets. The `.gitignore` is configured to exclude them.

---

## 🛠 Tech Stack

| Layer    | Technology                                          |
|----------|-----------------------------------------------------|
| Frontend | React 18, Vite 5, TypeScript, Tailwind CSS, shadcn/ui |
| Backend  | Python 3, FastAPI, Pydantic, Uvicorn                |
| Database | Supabase (PostgreSQL + Auth + Realtime)             |

---

## 📜 License

This project is private. All rights reserved.
