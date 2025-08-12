## DocSharing

Next.js 15 / React 19 app with tRPC (RSC), Prisma, Clerk auth, shadcn/ui, Lexical editor, S3 asset storage.

## Package Manager
Project standard: pnpm (locked via `packageManager` field).

Install dependencies:
```bash
pnpm install
```

Dev server:
```bash
pnpm dev
```

Build & start:
```bash
pnpm build
pnpm start
```

Lint:
```bash
pnpm lint
```

Prisma migrate (example):
```bash
pnpm prisma migrate dev --name <migration-name>
```

## Environment
Copy `.env.example` to `.env.local` and fill AWS, Clerk, Database credentials.

Key vars:
- `DATABASE_URL` – Postgres connection.
- `DOCUMENT_MAX_BYTES` – Max allowed markdown size (bytes). Server enforces; client reads build-time public env `NEXT_PUBLIC_DOCUMENT_MAX_BYTES` for early validation.
- `AWS_*` – S3 bucket + credentials for file storage.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` – Clerk auth keys.

Changing `DOCUMENT_MAX_BYTES` requires a server restart. Clients auto pick up the new limit after hydration because it’s fetched through tRPC.

## Import / Export Markdown
Use the split New button (left: blank, right caret: options) to create a blank doc or import a `.md` file. Import flow:
1. Client uses `NEXT_PUBLIC_DOCUMENT_MAX_BYTES` for a quick size pre-check.
2. Server validates (authoritative) using `DOCUMENT_MAX_BYTES` (UTF-8 byte length).
3. Any referenced `/api/file/<fileKey>` assets you own are re-linked.

Export: use per-document menu → Download (returns raw markdown).

## Deployment
Deploy on platforms supporting Next.js 15 (e.g. Vercel). Ensure environment variables and database are provisioned; run `pnpm build` then serve with `pnpm start`.
