# Run Project From Root

This project is optimized to run backend commands directly from the workspace root.

## Commands

Run from the root folder:

```powershell
npm run setup
npm run dev
```

Other useful commands:

```powershell
npm run check
npm run test
npm run start
```

## Notes

- Backend lives in `backend/`.
- Frontend static assets are served by backend on `http://localhost:5000`.
- Configure database values in `backend/.env` before first run.
