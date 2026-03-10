**Welcome to PayFlow**
**
**About**

This app now uses Supabase Auth for email verification.

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BACKEND_MODE=local
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

e.g.
VITE_BACKEND_MODE=local
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

5. In Supabase Auth settings, enable Email confirmations.

Run the app: `npm run dev`

**Publish your changes**

Push to `main`; GitHub Pages deploys automatically via workflow.

**Docs & Support**

Supabase Auth docs: [https://supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)
