# PrepPeer

AI mock interviews with real peer ranking, powered by Next.js 14, Supabase, and Groq.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Fill the values in `.env.local` before testing authenticated flows or AI interview generation. The key variables are documented in `.env.example`.

## Deploy

Optimized for [Vercel](https://vercel.com): import this repo, add the environment variables from `.env.example`, and deploy.

## Stack

- Next.js 14 (App Router)
- TypeScript, Tailwind CSS
- Supabase
- Groq
- Framer Motion, Lenis, Recharts, Lucide

## License

This project is licensed under the MIT License — see the LICENSE file for details.
