# EventShield AI

A fast, working prototype of the Challenge 4 college event platform and multimodal verification concept.
An AI-assisted event verification platform designed to identify
duplicate, suspicious, misleading, and potentially unreliable event listings.

## Quick start

### 1. Start PostgreSQL
```bash
docker compose up -d
```

### 2. Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```
Backend: http://localhost:3001

### 3. Frontend
In another terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:3000

## Demo accounts
- Admin: admin@eventshield.ai / Demo123!
- Organizer: organizer@eventshield.ai / Demo123!
- Student: student@eventshield.ai / Demo123!

## Demo flow
1. Open `/login` and sign in as admin.
2. Open `/admin` to see the verification queue.
3. Inspect an event to see Quality, Trust, Risk, findings, duplicate signals and component results.
4. Sign in as organizer and open `/submit` to create a new event. Submission triggers the verification pipeline.
5. Return to `/admin` to review it.

## AI note
The current verification engine is a transparent, deterministic development engine: field validation, semantic token similarity, URL checks and evidence aggregation. It is intentionally provider-agnostic so real text/vision/URL AI providers can be connected next without changing the product UI or API contract. It must not be presented as a trained model.
