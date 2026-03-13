# Quantos Developer Tools Landing Page

Containerized Express backend with Elasticsearch for a developer tools landing page.

## Quick Start

```bash
docker-compose up
```

Backend runs on `http://localhost:3001`, Elasticsearch on `http://localhost:9200`.

### Local Development (without Docker)

```bash
# Start Elasticsearch separately, then:
cd backend
npm install
npm run dev
```

## Default Credentials

- Username: `admin`
- Password: `admin123`

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | No | Login, returns JWT token |
| GET | /api/links | No | List all links sorted by position |
| POST | /api/links | JWT | Create a new link |
| PUT | /api/links/:id | JWT | Update a link |
| DELETE | /api/links/:id | JWT | Delete a link |

### Authentication

POST `/api/auth/login` with `{ "username": "admin", "password": "admin123" }` to get a JWT token.

Use the token in subsequent requests: `Authorization: Bearer <token>`

### Link Object

Links support any custom attributes (dynamic Elasticsearch mapping). Required field: `url`. Auto-generated fields: `position`, `created_at`, `updated_at`.

## Architecture

- **Backend**: Express + TypeScript, JWT auth, bcrypt password hashing
- **Database**: Elasticsearch 8.13.2 (single-node, security disabled for dev)
- **Containerization**: Multi-stage Docker build, docker-compose orchestration
- **Data Persistence**: Named Docker volume (`esdata`) for Elasticsearch data

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| ELASTICSEARCH_URL | http://localhost:9200 | Elasticsearch connection URL |
| JWT_SECRET | dev_secret | Secret for JWT signing |
| PORT | 3001 | Backend server port |
