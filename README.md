# Quantos - Developer Tools - Test task

## Project Structure

- **backend/**: Express 5 + TypeScript API server (port 3001)
- **frontend/**: Vue 3 + Vuetify 3 + Vite SPA (port 3000 dev)
- **docker-compose.yml**: Orchestrates Elasticsearch, backend, frontend

## Commands

**Docker:**

```bash
docker-compose up        # Start all services (ES on 9200, backend on 3001, frontend on 3000)
```

**Backend Development (from `/backend/`):**

```bash
npm install              # Install dependencies
npm run dev              # Start dev server with tsx watch (port 3001)
npm run build            # Build with tsup to dist/
npm run start            # Run production build
npm run test             # Run tests (node --test)
npm run test:watch       # Run tests in watch mode
```

**Frontend Development (from `/frontend/`):**

```bash
npm install              # Install dependencies
npm run dev              # Start Vite dev server (port 3000)
npm run build            # Type-check + Vite production build
npm run preview          # Preview production build
```

## Architecture

- **Backend**: Express 5, TypeScript (ES modules), JWT auth (bcrypt), Elasticsearch 8.13 client
- **Frontend**: Vue 3, Vuetify 3, Pinia stores, Vue Router, Axios HTTP client
- **Database**: Elasticsearch 8.13.2 (single-node, security disabled for dev)
- **Build**: tsup for backend, Vite for frontend, multi-stage Docker builds
- **Backend imports require `.js` extensions** (non-Nuxt TypeScript project)

## API Endpoints

| Method | Endpoint        | Auth | Description                       |
|--------|-----------------|------|-----------------------------------|
| POST   | /api/auth/login | No   | Login, returns JWT token          |
| GET    | /api/links      | No   | List all links sorted by position |
| POST   | /api/links      | JWT  | Create a new link                 |
| PUT    | /api/links/:id  | JWT  | Update a link                     |
| DELETE | /api/links/:id  | JWT  | Delete a link                     |

## Key Files

- `backend/src/main.ts` — Entry point, starts server after ES init + admin seed
- `backend/src/app.ts` — Express app factory (cors, json, routes, error middleware)
- `backend/src/config.ts` — JWT secret config
- `backend/src/elastic/client.ts` — Elasticsearch client + index init
- `backend/src/middleware/auth/` — JWT verification, admin seeding, user validation
- `backend/src/routes/` — auth, links, debug route handlers
- `frontend/src/main.ts` — Vue app entry
- `frontend/src/plugins/vuetify.ts` — Vuetify config
- `frontend/src/stores/` — Pinia stores (auth, links)
- `frontend/src/views/` — HomePage, LoginPage, AdminPage

## Environment Variables

| Variable          | Default               | Description                  |
|-------------------|-----------------------|------------------------------|
| ELASTICSEARCH_URL | http://localhost:9200 | Elasticsearch connection URL |
| JWT_SECRET        | dev_secret            | Secret for JWT signing       |
| PORT              | 3001                  | Backend server port          |
| VITE_API_URL      | http://localhost:3001/api | Frontend API base URL    |

## Default Credentials

- Username: `admin`
- Password: `admin123`

## Testing

- Backend tests use Node.js built-in test runner with supertest
- Test file: `backend/tests/api.test.ts`
- Run: `cd backend && npm test`
