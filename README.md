# LearningFaster MVP (Math)

LearningFaster is a production-oriented MVP for math learning with three core modes:
- Exercises by course/chapter
- Exercises by difficulty (1 to 5)
- Summary sheet generation

This repository is structured to ship fast while remaining scalable.

## Chosen stack
- **Next.js 14 (App Router)**: Full-stack React framework with server rendering and route protection.
- **TypeScript**: Type safety across UI, services, and models.
- **Tailwind CSS**: Fast and consistent UI composition.
- **Supabase**: Email/password auth, PostgreSQL database, and storage-ready architecture.

Why this stack:
- Fast MVP velocity
- Good production defaults
- Clear path for future AI/PDF processing features
- Easy deploy workflow on a Linux VPS

## Architecture overview

```txt
app/
  (auth)/auth/page.tsx
  (dashboard)/
    dashboard/page.tsx
    pdf-library/page.tsx
    exercises/course/page.tsx
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
  - exercises completed
- Recent PDFs widget
- Quick links to all learning modes

### 3) PDF Library
- Page: `/pdf-library`
- Displays user-owned PDF history with title, upload date, and file URL.

### 4) Learning modes (MVP stubs)
- `/exercises/course`: form + mock exercises by chapter
- `/exercises/level`: level selector (1-5) + mock exercises
- `/summaries`: topic input + mock summary sheet

### 5) Exercise tracking model
- `exercise_sessions` table designed for generated/completed states.
- Dashboard aggregates counters from these records.

## Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run SQL from `supabase/migrations/001_init.sql` in Supabase SQL editor.
4. In Supabase Auth settings, enable Email provider and disable **Confirm email** (so sign-up logs in users immediately).
5. (Optional now, needed soon) create a storage bucket for PDF files.

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

## GitHub workflow

```bash
git init
git add .
git commit -m "feat: initialize LearningFaster MVP"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## VPS deployment (Node + PM2 + Nginx)

### 1) Clone and configure

```bash
cd /var/www
git clone <YOUR_GITHUB_REPO_URL> learningfaster
cd learningfaster
cp .env.example .env.local
# fill .env.local with production values
npm install
npm run build
```

### 2) Start with PM2

```bash
npm install -g pm2
pm2 start npm --name learningfaster -- start
pm2 save
pm2 startup
```

By default Next.js runs on port 3000.

### 3) Nginx reverse proxy example

`/etc/nginx/sites-available/learningfaster`

```nginx
server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/learningfaster /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

(Then add HTTPS with Certbot.)

## Update after future pushes

```bash
cd /var/www/learningfaster
git pull origin main
npm install
npm run build
pm2 restart learningfaster
```

---

## Deployment command cheat sheet

### Local quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

### GitHub push (new repo)

```bash
git init
git add .
git commit -m "feat: initialize LearningFaster MVP"
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
