# Spendly — Monthly Budget Tracker

A clean, free web app to track your monthly budget and daily spending allowance.

---

## Features
- ✅ Sign up / sign in with email & password
- ✅ Set a monthly budget in any currency
- ✅ See remaining balance at a glance
- ✅ Daily spending allowance (auto-calculated)
- ✅ Log expenses with categories
- ✅ Delete expenses
- ✅ Visual progress bar

---

## Tech Stack (all free)
- **Frontend**: React + Vite
- **Backend / Auth / DB**: Supabase (free tier)
- **Hosting**: Vercel or Netlify (free tier)

---

## Setup Guide

### Step 1 — Set up Supabase (free)

1. Go to https://supabase.com and create a free account
2. Click **"New Project"**, give it a name (e.g. `spendly`), choose a region, set a database password
3. Wait ~2 minutes for the project to be ready
4. Go to **SQL Editor** (left sidebar) → click **"New query"**
5. Paste the contents of `supabase-schema.sql` and click **Run**
6. Go to **Project Settings → API**
7. Copy your **Project URL** and **anon / public key**

### Step 2 — Configure the app

1. In the project folder, copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```

2. Open `.env` and fill in your Supabase values:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...your_key_here
   ```

### Step 3 — Run locally

Make sure you have **Node.js** installed (https://nodejs.org), then:

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser. Done! 🎉

---

## Deploy for free (share with anyone)

### Option A: Vercel (recommended)
1. Push your code to GitHub
2. Go to https://vercel.com → New Project → import your repo
3. Add your environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
4. Click Deploy → get a free public URL

### Option B: Netlify
1. Push your code to GitHub
2. Go to https://netlify.com → Add new site → import from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables in Site Settings → Environment Variables
6. Deploy

---

## Supabase Auth Note
By default, Supabase requires email confirmation. To disable this for easier testing:
- Go to **Authentication → Providers → Email**
- Turn off **"Confirm email"**

---

## Project Structure
```
src/
  hooks/
    useAuth.jsx       ← Auth context
  lib/
    supabase.js       ← Supabase client
  pages/
    AuthPage.jsx      ← Sign in / Sign up
    Dashboard.jsx     ← Main budget tracker
  App.jsx             ← Root component
  index.css           ← Global styles
  main.jsx            ← Entry point
supabase-schema.sql   ← Run this in Supabase SQL Editor
```
