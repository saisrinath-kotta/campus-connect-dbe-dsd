# 🚀 CampusConnect Cloud Deployment Guide

This guide details how to deploy **CampusConnect** to production using free tiers (e.g., **Render / Railway** for Backend, **Supabase / Neon** for PostgreSQL, and **Vercel / Render** for Frontend).

---

## 🏗️ Architecture Overview

| Component | Recommended Free Host | Notes |
| :--- | :--- | :--- |
| **Database** | [Neon](https://neon.tech/) or [Supabase](https://supabase.com/) | Hosted PostgreSQL |
| **Backend API** | [Render](https://render.com/) or [Railway](https://railway.app/) | FastAPI / Python 3.11 |
| **Frontend** | [Vercel](https://vercel.com/) or Render Static Site | React + Vite (`dist/`) |

---

## 1️⃣ Database Setup (Neon or Supabase)

1. Sign up on [Neon.tech](https://neon.tech/) or [Supabase.com](https://supabase.com/).
2. Create a new PostgreSQL project named `campusconnect`.
3. Copy your connection URI. It will look like:
   ```text
   postgresql://user:password@ep-cool-project-1234.us-east-2.aws.neon.tech/campusconnect?sslmode=require
   ```

*(Note: CampusConnect automatically converts `postgres://` or `postgresql://` to `postgresql+psycopg://` and auto-creates all schema tables on server boot).*

---

## 2️⃣ Backend Deployment (Render)

1. Push your repository to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Web Service**.
3. Select your GitHub repository.
4. Set the following build options:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   - `DATABASE_URL`: *(Your cloud PostgreSQL connection string from Step 1)*
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL (e.g. `https://campusconnect-api.onrender.com`).
8. Seed sample data (optional): Use the Render Web Shell to run:
   ```bash
   python seed.py
   ```

---

## 3️⃣ Frontend Deployment (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New...** > **Project**.
2. Import your GitHub repository.
3. In project settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://campusconnect-api.onrender.com` *(Replace with your actual backend URL from Step 2)*
5. Click **Deploy**.

---

## ✅ Deployment Checklist

- [x] Frontend production build verified (`npm run build` passes cleanly).
- [x] Backend startup hook auto-creates database tables and columns upon boot.
- [x] `backend/Procfile` added for cloud runners.
- [x] `frontend/vercel.json` added for hosting.
- [x] `backend/.env` is ignored by `.gitignore` to keep credentials secure.
