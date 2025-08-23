<div align="center">

# DocShare

![Screenshot](./assets/app.png)

Opinionated, authenticated Markdown knowledge base with a rich Lexical editor, automatic saving, S3-backed asset uploads, per‑user quota & size enforcement, and shareable read‑only viewer pages – all built on Next.js 15 (App Router + RSC), React 19, tRPC 11, Prisma, Clerk, shadcn/ui & TailwindCSS 4.

</div>

## ✨ Core Features

- Authenticated workspace (Clerk) – all `/api` + `/documents` routes protected by edge middleware.
- Rich Markdown authoring powered by a Lexical-based editor (inline code, blocks, lists, math (KaTeX), Mermaid diagrams, code highlighting etc.).
- Autosave (1s debounce + background beacon on unload / navigation) with optimistic sidebar ordering.
- Import existing `.md` files – server derives title from front‑matter or first `#` heading.
- Export raw Markdown (`/api/download/:docId`).
- Embedded asset management: direct S3 presigned POST uploads; unused assets soft‑deleted on content update.
- Per‑user file quota & document size enforcement (configurable).
- Shareable read‑only viewer pages (`/viewer/:docId`) with SSR prefetch + hydration via TanStack Query.
- Dark‑mode / theming via `next-themes` (if integrated through shadcn/ui tokens).
- Fully typed end‑to‑end API via tRPC (no separate REST client types needed).

## 🧱 Domain Model (Prisma)

```
Document(id, userId, title, content, createdAt, updatedAt)
File(id, userId, fileKey, fileName, fileType, fileSize?, documentId?, deletedAt?, createdAt, updatedAt)
```

Relations: `Document 1 - n File`. Files are soft‑deleted (set `deletedAt`) when no longer referenced in the document body (`/api/file/<fileKey>` pattern).

## 🔌 High‑Level Architecture

| Layer | Purpose |
|-------|---------|
| Next.js App Router (RSC) | Layout composition, server data prefetch (Query Client + tRPC). |
| tRPC 11 | Type‑safe procedures (`document.*`). |
| Prisma | Postgres ORM; generated client output in `lib/generated/prisma`. |
| Clerk | Auth context injection in tRPC + middleware route protection. |
| S3 (AWS) | Binary asset storage; presigned POST for direct browser uploads. |
| Zustand Store | Local editor state + saved vs dirty diffing. |
| TanStack Query | Client cache hydration + reactivity for procedures. |

### Save Cycle
1. User edits title/content (Zustand current state updates `isSaved=false`).
2. Debounced effect (1s) triggers `document.setDocument` mutation.
3. On success: saved state updated; documents list re‑ordered with updated doc first (manual cache manipulation).
4. On unload / route change: a `navigator.sendBeacon` ensures last edits persist even if the debounce window not reached.

### File Lifecycle
1. User requests upload: client calls `/api/upload` with file metadata.
2. Server checks remaining quota, creates DB `File` (size null) + returns presigned POST (URL + fields + key).
3. Browser uploads directly to S3.
4. Client invokes `confirmUpload` server action with `fileKey` + `documentId` – server queries S3 HEAD to record `fileSize` and associates file to document.
5. On document save, server parses markdown for `/api/file/<key>` references; unreferenced files are soft‑deleted (can be GC'd later by a background job – not included yet).

## 🛠️ Local Development

### 1. Prerequisites
- Node.js 20+
- pnpm (see `packageManager` field)
- Postgres database
- AWS S3 bucket & IAM credentials
- Clerk application (publishable + secret keys)

### 2. Clone & Install
```bash
pnpm install
```

### 3. Environment Variables

Create `.env.local` (or supply via deployment platform). Suggested template:
```
DATABASE_URL=postgresql://user:pass@host:5432/db
DOCUMENT_MAX_BYTES=200000
NEXT_PUBLIC_DOCUMENT_MAX_BYTES=200000
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

Notes:
- `DOCUMENT_MAX_BYTES` (server) and `NEXT_PUBLIC_DOCUMENT_MAX_BYTES` (client) should match; client performs early pre‑check, server is authoritative.
- Changing size limits requires a dev server restart to update the server constant.

### 4. Database
Generate & apply migrations (already present migrations will apply):
```bash
pnpm prisma migrate dev
```
Generate Prisma Client (runs automatically on `migrate`):
```bash
pnpm prisma generate
```

### 5. Run
```bash
pnpm dev
```
Visit http://localhost:3000 – unauthenticated users will be redirected to sign‑in for protected routes.

### 6. Build Preview
```bash
pnpm build && pnpm start
```

## 🧾 API Overview (tRPC Procedures)

`document.importMarkdown(content, title?)` – Create new document from raw markdown (derives title if absent). Size enforced.
`document.getById(id)` – Fetch single document (public: viewer pages do not require auth for reading if you relax middleware – currently protected everywhere except viewer route which uses server fetch). Note: Middleware protects `/api` calls; the viewer page prefetch runs server‑side with user's session.
`document.getAllDocumentsForUser()` – List current user documents (desc by updatedAt).
`document.newDocument()` – Create empty document.
`document.setDocument({id, title?, content?})` – Partial update + file reference sync.
`document.renameDocument({id, title})` – Title only update.
`document.deleteDocument({id})` – Delete (hard) document.

### REST / Route Handlers
`POST /api/upload` – Returns S3 presigned POST + creates File record (size null). Enforces remaining quota.
`GET /api/file/:key` – Redirects to public S3 object URL (simple indirection layer).
`GET /api/download/:docId` – Raw markdown download with `Content-Disposition` attachment.

### Server Action
`confirmUpload({fileKey, documentId})` – After direct upload, records file size via S3 `HeadObject` and associates file.

## 🔐 Authentication & Authorization
- Clerk middleware guards `/api` & `/documents` routes; viewer pages are public only if middleware exclusion added (currently they are not matched by `/documents` or `/api` patterns – `/viewer` is public for read access).
- Procedure-level auth: `protectedProcedure` enforces `userId` presence; public read limited to `document.getById` inside router but effective exposure depends on middleware.

## 📦 File & Document Size Enforcement
- Document: UTF‑8 byte length measured with `TextEncoder`; error if > `DOCUMENT_MAX_BYTES`.
- Files: Quota is `100MB` per user (simple sum of recorded `fileSize`). Upload route sets dynamic max object size in presigned POST conditions.

## ♻️ File Garbage Collection (Soft Delete)
On each `setDocument` or `importMarkdown`, server diff identifies removed file keys and sets `deletedAt`. A future background process could:
1. Hard delete S3 objects where `deletedAt < now() - gracePeriod`.
2. Remove DB rows.

## 🚀 Deployment
Typical (e.g. Vercel):
1. Provision Postgres & run migrations (`prisma migrate deploy`).
2. Set environment variables (including both Clerk keys and size configs).
3. Build with `pnpm build`.
4. Start with `pnpm start` (production). Edge middleware runs at the platform edge.

Ensure your S3 bucket CORS allows presigned POST from your origin & `GET` for public viewing.

## 🧭 Project Structure Highlights
```
app/
	documents/            # Editor pages (protected)
	viewer/               # Public read-only rendering
	api/                  # Upload, file redirect, download, tRPC
components/editor/      # Lexical editor, plugins, autosave
components/layout/      # Sidebar, header, responsive shell
components/viewer/      # Markdown display components
lib/trpc/               # tRPC setup (server + client bindings)
lib/actions/            # Server actions (upload confirmation)
lib/hooks/              # Zustand editor store hooks
prisma/                 # Schema + migrations
```
## 📜 License
MIT

---
Made with ❤️ using Next.js, tRPC & Prisma.
