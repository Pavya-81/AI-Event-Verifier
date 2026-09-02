# EventShield AI — quickest demo

1. Install Node.js 18+ and Docker Desktop.
2. Run `docker compose up -d` from the project root.
3. Terminal 1: `cd backend && npm install && npx prisma generate && npx prisma db push && npx tsx prisma/seed.ts && npm run dev`
4. Terminal 2: `cd frontend && npm install && npm run dev`
5. Open http://localhost:3000
6. Admin demo: http://localhost:3000/login → admin@eventshield.ai / Demo123!
7. Organizer demo: http://localhost:3000/login → organizer@eventshield.ai / Demo123!

The current verification engine is transparent development logic (validation, semantic similarity, URL checks and evidence aggregation), not a trained ML model. The API contract and UI are ready for real multimodal providers in the next iteration.
