# Habit Garden

A small, single-user habit tracker: add daily habits, mark completed days, and see a year of progress as a GitHub-style heatmap. Each habit shows current streak, best streak, and total check-ins. The React PWA uses a Go API; progress is saved in `data/habits.json`.

## Run locally

Requires Node.js 20.19+ and Go 1.27+.

1. Install frontend packages: `npm install`
2. Start the API in one terminal: `go run ./server`
3. Start Vite in another terminal: `npm run dev`
4. Open the URL Vite prints (usually `http://localhost:5173`).

The development server proxies `/api` to Go. For a production build, run `npm run build` and then `go run ./server`; Go serves `dist/` and the API on `http://127.0.0.1:8080`.

To install as a PWA, open the production URL in a supported browser and choose its install/add-to-home-screen action. Service-worker/offline syncing is not included.

## Deploy to Railway

Railway detects the root `Dockerfile` automatically. Commit `package-lock.json` with the project because the image installs dependencies with `npm ci`. Railway scans `.env.example` and suggests `DATA_FILE` and `PORT`; import them in the service's Variables tab. Attach a Railway Volume mounted at `/data` so `/data/habits.json` persists.

For local Docker runs, build with `docker build -t habit-garden .`, then use `docker run --env-file .env -p 8080:8080 -v habit-data:/data habit-garden`. `.env` is git-ignored; `.env.example` is the safe template Railway can suggest importing.

**Do not generate a public domain yet:** this personal app has no authentication, so anyone with its URL could view or change your habits. Add access protection before exposing it publicly.

References: [Railway Dockerfiles](https://docs.railway.com/guides/dockerfiles), [Railway Volumes](https://docs.railway.com/guides/volumes), [Railway variables](https://docs.railway.com/reference/variables).

## Code layout

- `src/App.tsx` composes the screen and owns page state.
- `src/components/` contains habit UI; `src/lib/` contains API and date logic.
- `server/main.go` starts the server; `handler.go`, `model.go`, and `store.go` handle HTTP, validation, and JSON persistence.

## Data and safety

There are no accounts. The server binds to loopback by default and stores data locally in `data/habits.json`. Back up that file to preserve progress. Do not expose the unauthenticated API to the internet; remote access needs authentication and HTTPS first. Set `DATA_FILE` to change the save location or `ADDR` to change the bind address.
