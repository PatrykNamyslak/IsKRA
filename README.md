# hackyeah-2026

## Build and Run — Production
### Requirements
- Docker or Podman
- If you use Podman, you can optionally create a Docker alias:
```shell
alias docker=podman
```

### Start the application
```shell
docker compose up
```
The initial build may take a few minutes. Once it finishes, the application will be available at:
```text
http://localhost:3000
```

## Development
### Requirements
- Docker or Podman
- Node.js v24
### Run PostgreSQL only
```shell
docker compose up -d postgres
```
### Run the Next.js application in Docker only
```shell
docker compose up -d web
```
### Run the Next.js application locally
```shell
cd ./web
npm run dev
```