Deploying to Vercel with Supabase storage (step-by-step)

Overview
- This project now stores uploaded files in Supabase Storage (bucket `uploads`) and metadata in a Supabase table `uploads`.
- Vercel is fully compatible; we must set server-side environment variables in the Vercel project.

1) Create the Supabase resources
- Open your Supabase project console.
- Storage > Buckets > Create a bucket named `uploads`.
  - If you make the bucket Public, the `getPublicUrl` calls will return a public URL.
  - If you make it Private, you'll need to return signed URLs for downloads (current code expects public URLs).
- Database > SQL Editor: run the SQL in `supabase/migrations/001_create_uploads_table.sql` (or copy/paste):

  CREATE TABLE IF NOT EXISTS public.uploads (
    id text PRIMARY KEY,
    title text,
    artist text,
    price text,
    section text,
    fileName text,
    url text,
    createdAt timestamptz DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS uploads_section_idx ON public.uploads (section);
  CREATE INDEX IF NOT EXISTS uploads_createdat_idx ON public.uploads (createdAt DESC);

2) Create API key for server (Service Role Key)
- In Supabase console: Settings -> API
- Copy the Service Role Key (KEEP THIS SECRET). We'll use it only on the server (Vercel env vars).

3) Add environment variables in Vercel
- In your Vercel project, go to Settings → Environment Variables and add the following (set for both Preview and Production):
  - `SUPABASE_URL` = your Supabase project URL (e.g. https://xyz.supabase.co)
  - `SUPABASE_SERVICE_ROLE_KEY` = the Service Role Key you copied

- Optional (client-side):
  - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL (only if you use it on the client)

4) Local testing (before you push)
- Create `.env.local` at repo root with these values for local dev (do not commit `.env.local`):

  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

- Install deps (if not already):
  ```powershell
  npm install
  ```
- Run dev server:
  ```powershell
  npm run dev
  ```
- Use the Upload UI to upload a file and check:
  - Supabase > Storage > uploads: file appears
  - Supabase > Table Editor > uploads: row inserted
  - The app fetches `/api/uploads?section=...` and shows items

5) Push to GitHub and deploy to Vercel
- Commit your changes and push to the branch connected to Vercel (e.g., `main`):
  ```powershell
  git add .
  git commit -m "Use Supabase storage for uploads"
  git push origin main
  ```
- Vercel will automatically build and deploy the project. Watch the deployment logs in the Vercel dashboard.

6) Notes & troubleshooting
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only in Vercel — never expose it to the browser.
- If your storage bucket is private, change the code to use signed URLs (Supabase storage supports signed URLs).
- If uploads fail: check Vercel build logs and runtime logs for missing env vars or permission errors.

If you want, I can:
- Create a small SQL migration script compatible with the Supabase CLI.
- Add signed URL support (if you prefer a private bucket).
- Walk you through the Vercel env var configuration step-by-step.
