# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup       # Install deps, generate Prisma client, run DB migrations
npm run dev         # Start dev server (Turbopack) at http://localhost:3000
npm run build       # Production build
npm run lint        # ESLint
npm run test        # Run all tests (Vitest)
npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx  # Run single test file
npm run db:reset    # Reset SQLite database (destructive)
```

The dev server requires `NODE_OPTIONS='--require ./node-compat.cjs'` — this is already set in the npm scripts.

## Architecture

UIGen is a Next.js 15 app where users describe React components in a chat, and Claude generates them with a live preview.

### AI generation flow

`POST /api/chat` ([src/app/api/chat/route.ts](src/app/api/chat/route.ts)) drives everything:
- Receives messages + a serialized `VirtualFileSystem` state from the client
- Calls `getLanguageModel()` ([src/lib/provider.ts](src/lib/provider.ts)) — returns real `claude-haiku-4-5` if `ANTHROPIC_API_KEY` is set, otherwise a `MockLanguageModel`
- Streams responses via Vercel AI SDK `streamText` with two tools: `str_replace_editor` and `file_manager`
- On finish, persists messages + file system state to the database if the user is authenticated and a `projectId` was sent

### Virtual file system

`VirtualFileSystem` ([src/lib/file-system.ts](src/lib/file-system.ts)) is an in-memory tree of `FileNode` objects. It never writes to disk. Files are serialized to JSON for transport between client and server, and stored as a JSON string in the `Project.data` DB column.

The two AI tools (`str_replace_editor`, `file_manager`) mutate this VFS on the server during streaming, and the final state is sent back to the client via the data stream.

### Live preview

`PreviewFrame` ([src/components/preview/PreviewFrame.tsx](src/components/preview/PreviewFrame.tsx)) renders an iframe. The JSX transformer ([src/lib/transform/jsx-transformer.ts](src/lib/transform/jsx-transformer.ts)) compiles VFS files with `@babel/standalone` at runtime, creates Blob URLs, and builds an import map so the iframe can load the generated React app. Third-party imports are resolved via `esm.sh`.

### Auth

JWT-based auth stored in an httpOnly cookie (`auth-token`). `src/lib/auth.ts` handles session creation/verification. The middleware (`src/middleware.ts`) protects `/api/projects` and `/api/filesystem` routes. The chat route (`/api/chat`) is intentionally unprotected — anonymous users can generate components, but results are only persisted for authenticated users with a `projectId`.

### Database

SQLite via Prisma. Schema is defined in [prisma/schema.prisma](prisma/schema.prisma) — reference it any time you need to understand the structure of the data stored in the database. Two models: `User` (email + bcrypt password) and `Project` (stores messages and VFS state as JSON strings). Prisma client is generated into `src/generated/prisma/`.

### State management

Two React contexts:
- `FileSystemContext` ([src/lib/contexts/file-system-context.tsx](src/lib/contexts/file-system-context.tsx)) — client-side VFS state
- `ChatContext` ([src/lib/contexts/chat-context.tsx](src/lib/contexts/chat-context.tsx)) — chat messages and streaming state

### Environment

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | No | Real AI generation; falls back to `MockLanguageModel` if absent |
| `JWT_SECRET` | No | Signs auth tokens; defaults to `"development-secret-key"` |
