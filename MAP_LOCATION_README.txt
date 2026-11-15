AGROVERSE AI - Map location update

1. Extract this ZIP to a NEW folder. Do not overwrite the old working project.
2. Copy backend/.env from your OLD working project to backend/.env in this NEW project (never share .env).
3. From backend run your usual uvicorn command. From frontend run npm install and npm run dev.
4. Signup now requires selecting a location by clicking the OpenStreetMap map.
5. Existing users can login, open My Profile, click on the map and Save to update coordinates in backend.
6. Dashboard climate requests use saved farm coordinates; Farm Map marker uses saved coordinates.
7. Location is displayed as latitude/longitude (not reverse-geocoded place names).
8. Map tiles require internet access.
9. Full npm build/runtime testing was not completed in this environment. Test before merging to GitHub.
10. Existing database and backend secrets are NOT bundled. Preserve your original backend database if using a local database.
