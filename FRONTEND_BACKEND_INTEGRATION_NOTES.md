# Frontend–Backend Integration Notes

## Connected in this update
- Login now calls `POST /api/auth/login` and stores the returned access token, refresh token, and user profile in browser local storage.
- Registration now calls `POST /api/auth/register`, then signs in through the login endpoint.
- The climate dashboard now calls `GET /api/climate` on the FastAPI backend rather than calling NASA POWER directly from the browser.
- API requests use `VITE_API_BASE_URL` (default: `http://localhost:8000/api`) and attach the bearer access token when present.
- Sign Out clears the locally stored session tokens.
- The frontend no longer calls the nonexistent `/api/soil-ph` route. The UI now reports that soil-pH analysis is not implemented in the current backend.

## Still not connected
- Farm profile save/load still uses browser local storage. Backend farm CRUD requires latitude, longitude, area in hectares, and normalized soil/irrigation enum values; the current form does not collect all of those fields yet.
- Crop recommendation, crop rotation, and AI advisor still use frontend/demo logic and need separate API wiring.
- Automatic access-token refresh is not implemented; users may need to sign in again when the access token expires.

## Run locally
1. Start the backend using its backend README and configure `backend/.env` (including a strong `SECRET_KEY`, database URL, and CORS origins).
2. In `frontend/`, copy `.env.example` to `.env` if you need a non-default API URL.
3. Run `npm install`, then `npm run dev`.
4. Register a user from the login screen, sign in, then open Climate Insights and select **Load Climate Data**.

## Verification status
The source changes were reviewed, but a frontend production build was not run in this environment because `node_modules` is not present. Runtime integration still needs to be verified with the backend and database running.
