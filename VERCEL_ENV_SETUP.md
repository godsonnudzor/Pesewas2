Vercel + Supabase setup

1) Add env vars in Vercel Dashboard
- Open your project in Vercel
- Settings → Environment Variables
- Add the following (set as "Environment" to the desired scope: Production / Preview / Development)
  - `SUPABASE_URL` → https://<your-project>.supabase.co
  - `SUPABASE_ANON_KEY` → <anon or service key>
  - (Optional for frontend builds) `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

2) Using Vercel CLI (interactive)
Run these commands and paste the values when prompted (repeat for `preview`/`development` if needed):

```bash
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
```

3) Verify environment vars
- List vars: `vercel env ls`
- After deploying, you can test the API health endpoint (replace with your deployment URL):

```bash
curl https://<your-deployment-url>/api/health
```

4) Notes
- Never commit real keys to the repo. Use the Vercel Dashboard or CLI to store secrets securely.
- If you use `NEXT_PUBLIC_*` keys, they will be embedded into client-side bundles and are public.
- After adding vars, redeploy the project so build-time vars are available to frontend bundles.
