# AGROVERSE AI — new frontend + existing backend integration

## Scope
- Replaced the runtime frontend with the uploaded `agroverse.frontend.zip` UI, preserving its Landing Page, language switcher, signup, profile, crop tools and styling.
- Retained the existing FastAPI backend and its API endpoints. Only updated default CORS origins and `.env.example` for Vite port 5174.
- Replaced browser-only demo accounts with `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/farms` and `/api/farms/{id}`.
- Climate now uses `/api/climate`, with response adaptation for existing charts.
- Password reset is **request only**. Backend does not deliver email automatically. No unsafe password reset without token.
- Soil pH feature has no matching backend endpoint; UI reports unavailable rather than silently making a broken request.
- Crop Recommendation, Rotation and AI Advisor UI are retained, but their backend wiring is not complete. Do not claim they are live AI features.
- Original integration-only source files are kept under `integration_reference/previous_frontend_src` for manual review; these are NOT part of the runtime UI.
- Existing local `.env`, SQLite database, tokens, and `node_modules` are intentionally NOT included. Do not commit secrets.

## Run on Windows
```powershell
cd backend
Copy-Item .env.example .env  # only if .env does not already exist
# edit .env and set a strong SECRET_KEY; ensure CORS_ORIGINS is JSON list
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
In another terminal, from repository root:
```powershell
cd frontend
npm ci
npm run dev
```
Open the URL Vite prints, usually http://localhost:5173 or :5174.

## Important limitations
- Existing demo localStorage accounts cannot log into the backend; register them again. Do not copy hashed passwords into database.
- New registration creates a user then a farm; if farm creation fails, account exists and must be repaired separately. The UI reports this partial failure.
- The frontend currently uses a fixed Purulia location; area values are treated as hectares.
- Auth tokens are stored in sessionStorage and expire with the browser tab session. Full refresh/re-auth testing requires a running backend.
- Profile name is stored in the farm's `farmer_name`, not a user table name column.
- This ZIP is a working tree, **not** a Git history/branch. Do not force-push. Create a new branch from the actual integration branch and review changes before merging.

## Safe Git workflow
1. Clone/fetch your real repository and `git switch integration` then `git pull --ff-only`.
2. Create `git switch -c review/new-frontend-integration`.
3. Copy the updated `frontend/`, the CORS changes to `backend/app/core/config.py` and `backend/.env.example`, and `MERGE_GUIDE.md` into the clone. Keep your real `.git` directory untouched.
4. Inspect `git diff --stat` and `git diff --check`; test `npm ci && npm run build` and backend startup.
5. Commit and push the **review** branch; open a PR targeting `integration`. Check deletions, backend changes, and all UI features before merge.
