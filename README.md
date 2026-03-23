# LearningFaster (MVP)

LearningFaster is a math-first learning web app MVP with three modes:
- Exercises by course/chapter
- Exercises by level (1-5)
- Summary sheets

This repository provides a production-minded foundation with authentication, protected routes, dashboard metrics, PDF history/library and Supabase-ready backend integration.

## Chosen stack

- **Next.js 14 (App Router)** + **TypeScript**
- **Tailwind CSS** for fast, consistent UI
- **Supabase** for Auth + PostgreSQL + Storage

Why this stack:
- Ships fast for MVP
- Cleanly scalable for feature growth
- Straightforward VPS deployment (Node + PM2 + Nginx)

## Project architecture

```text
app/
  (auth)/auth/page.tsx
  (dashboard)/
    dashboard/page.tsx
    pdf-library/page.tsx
    pdf-library/[pdfId]/page.tsx
    exercises/course/page.tsx
    exercises/course/workspace/[pdfId]/page.tsx
    exercises/level/page.tsx
    summaries/page.tsx
components/
  ui/
features/
  auth/
  dashboard/
  pdf-library/
  exercises/
  summaries/
lib/
  supabase/
supabase/
  migrations/001_init.sql
  migrations/002_pdf_storage.sql
  migrations/003_pdf_chapter.sql
types/
```

Key principles:
- Route-level composition in `app/`
- Domain logic in `features/`
- Shared primitives in `components/ui`
- Infrastructure clients in `lib/supabase`
- Shared contracts in `types`

## Implemented MVP features

### 1) Authentication
- Sign up / sign in / sign out using Supabase email/password.
- Auth page at `/auth`.
- Protected routes via `middleware.ts` + server session check.

### 2) Dashboard
- Landing page after login: `/dashboard`.
- Counters:
  - exercises generated
  - courses transformed into sheets
- Recent PDFs widget with direct button to open viewer page
- Quick links to all learning modes

### 3) PDF Library
- Page: `/pdf-library`
- Upload form with storage per user folder (`userId/...`).
- Chapter-aware uploads with chapter suggestions reused in course/summaries workflows.
- List of uploaded PDFs with link to a dedicated in-app reader page.
- Dedicated reader page displays the PDF and 2 placeholder summary blocks.

### 4) Learning modes (MVP stubs)
- `/exercises/course`: choose existing PDF or upload, target chapter, then open workspace.
- `/exercises/course/workspace/[pdfId]`: PDF visualization + placeholder for generated exercises.
- `/exercises/level`: level selector (1-5) + mock exercises
- `/summaries`: topic input + chapter-aware PDF attachment/upload + mock summary sheet

### 5) Exercise tracking model
- `exercise_sessions` table designed for generated/completed states.
- Dashboard aggregates counters from these records.

## Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run SQL from `supabase/migrations/001_init.sql` in Supabase SQL editor.
4. Run SQL from `supabase/migrations/002_pdf_storage.sql` in Supabase SQL editor (creates `pdfs` bucket + policies).
5. Run SQL from `supabase/migrations/003_pdf_chapter.sql` in Supabase SQL editor (adds chapter metadata on uploaded PDFs).
6. In Supabase Auth settings, enable Email provider and disable **Confirm email** so users are signed in right after sign up.

## Database schema (MVP)

Tables:
- `profiles`
- `pdf_documents`
- `exercise_sessions`
- `summary_sheets`

Security:
- RLS enabled on all user data tables
- Policies restrict access to owner (`auth.uid() = user_id` or `id`)
- Trigger auto-creates profile row when a new auth user is created

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run build
npm run start
```

## Environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Git workflow

```bash
git init
git add .
git commit -m "feat: initialize learningfaster mvp"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## VPS deployment (Node + PM2 + Nginx)

### 1) Clone and install

```bash
cd /var/www
git clone <YOUR_GITHUB_REPO_URL> learningfaster
cd learningfaster
cp .env.example .env.local
# fill env vars
npm install
npm run build
```

### 2) Start with PM2

```bash
npm install -g pm2
pm2 start npm --name learningfaster -- start
pm2 save
pm2 status
```

### 3) Nginx reverse proxy (HTTP)

Create `/etc/nginx/sites-available/learningfaster`:

```nginx
server {
  listen 80;
  server_name YOUR_DOMAIN;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/learningfaster /etc/nginx/sites-enabled/learningfaster
sudo nginx -t
sudo systemctl reload nginx
```

### 4) HTTPS (recommended)

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN
```

## Update process after future pushes

From VPS app directory:

```bash
git pull origin main
npm install
npm run build
pm2 restart learningfaster
```

For a hard reset to remote state (overwrites local code):

```bash
git fetch origin
git reset --hard origin/main
git clean -fd
npm install
npm run build
pm2 restart learningfaster
```

## Optional helper script

A helper is included at `scripts/reset_pull_deploy.sh`.

Usage:

```bash
./scripts/reset_pull_deploy.sh main
# or
APP_NAME=learningfaster ./scripts/reset_pull_deploy.sh feat/test-connection
```

## Deployment command cheat sheet

### Local dev

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Git init / first push

```bash
git init
git add .
git commit -m "feat: initialize learningfaster mvp"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

### VPS first deploy

```bash
cd /var/www
git clone <YOUR_GITHUB_REPO_URL> learningfaster
cd learningfaster
cp .env.example .env.local
npm install
npm run build
npm install -g pm2
pm2 start npm --name learningfaster -- start
pm2 save
```

### VPS update deploy

```bash
cd /var/www/learningfaster
git pull origin main
npm install
npm run build
pm2 restart learningfaster
```
