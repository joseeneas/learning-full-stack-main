# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## About this repo
Spring Boot (Java 21) backend + React (Vite) frontend. Maven bundles the frontend into the backend JAR (via frontend-maven-plugin + resources copy). Container images are built with Jib. CI runs on GitHub Actions. Optional deployment uses AWS Elastic Beanstalk with a docker-compose file that wires RDS env vars.

## Prerequisites
- Java 21 (Temurin recommended)
- Node.js ≥18 and npm
- Docker (for local Postgres and container runs)

## Commands you’ll commonly use

Backend (Spring Boot)
- Run (default profile): `./mvnw spring-boot:run`
- Run with dev profile (e.g., RDS/alt DB): `SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run`
- Run with local profile (uses src/main/resources/application-local.properties): `./mvnw spring-boot:run -Dspring-boot.run.profiles=local`
- Package JAR (bundles FE via default active profile): `./mvnw clean package`
- Run packaged app: `java -jar target/spring-boot-full-stack-professional-0.0.1-SNAPSHOT.jar`

Frontend (Vite)
- Dev server (proxies /api → :8080):
  - `cd src/frontend && npm install && npm run dev`
- Production build (used by Maven bundling): `cd src/frontend && npm run build`
- Preview build locally: `cd src/frontend && npm run preview`

Testing (Maven; unit + integration)
- All unit tests: `./mvnw test`
- Full suite (unit + IT): `./mvnw verify`
- Skip integration tests: `./mvnw -DskipITs=true verify`
- Run a single unit test: `./mvnw -Dtest=StudentServiceTest test`
- Run a single integration test: `./mvnw -Dit.test=StudentExportIT verify`

Container builds & runs (Jib)
- Local Docker image: `./mvnw clean install -P bundle-backend-and-frontend -P jib-build-local-docker-image -Dapp.image.tag=local`
- Run local image (macOS/Windows host DB):
  - `docker run --name fullstack -p 8080:8080 -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/syscomz -e SPRING_DATASOURCE_USERNAME=<user> -e SPRING_DATASOURCE_PASSWORD=<pass> springboot-react-fullstack:local`
- Push to Docker Hub (requires creds configured):
  - `./mvnw clean install -P bundle-backend-and-frontend -P jib-build-docker-image-and-push-it-to-docker-hub -Dapp.image.tag=<tag>`

CI / GHCR (see .github/workflows/ci.yml)
- CI builds and tests on push/PR, optionally builds an OCI tar and pushes an image to GHCR with tags `<sha>` and `latest`.

Elastic Beanstalk (optional)
- Upload `elasticbeanstalk/docker-compose.yaml` in the EB console. The compose file reads `${RDS_*}` envs provided by EB and maps container 8080 → host 80.

Database helpers (scripts/)
- Backup: `./scripts/backup-db.sh [out-dir]` (pg_dump custom format)
- Restore: `./scripts/restore-db.sh <dump-file>`
- Fix local permissions/ownership: `SUPERUSER=postgres PGPASSWORD={{superuser_pwd}} ./scripts/fix-db-permissions.sh`
- Quick row counts across connections: `./scripts/check-student-counts.sh`

## High-level architecture & structure
- Backend (Spring Boot)
  - Package: `com.syscomz.springbootfullstackprofessional`
  - Web/API: REST controllers under `student/` (e.g., `StudentController`) using service + repository layers.
  - Persistence: Spring Data JPA with PostgreSQL; integration tests use H2 in PostgreSQL mode (`src/test/resources/application-it.properties`).
  - CORS: `CorsConfig` reads `app.cors.origins` and applies to `/api/**`; include `http://localhost:5173` for Vite dev.
  - Security: `SecurityConfig` disables CSRF and permits all requests (public API).
  - Configuration: profile-specific properties in `src/main/resources/` (`application.properties`, `application-dev.properties`, `application-local.properties`).
  - Actuator: health/info/metrics exposed; useful for smoke checks.
- Frontend (React + Vite)
  - Located at `src/frontend` with Vite config (`vite.config.js`) that proxies `/api` to `http://localhost:8080` and outputs to `build/`.
  - During Maven build, `frontend-maven-plugin` installs Node/npm, builds the FE, and `maven-resources-plugin` copies `build/` into `target/classes/static` so the JAR serves the FE.
- Build & Images
  - Maven profiles:
    - `bundle-backend-and-frontend` (active by default): builds FE and bundles into the JAR.
    - `jib-build-local-docker-image`: builds a local image `springboot-react-fullstack:<tag>`.
    - `jib-build-docker-image-and-push-it-to-docker-hub`: pushes `joseeneassilva/<image>:<tag>` and `:latest`.
  - Dockerfile exists for conventional builds, but Jib is the primary path in CI.
- CI/CD (GitHub Actions)
  - `ci.yml`: build & test (Java 21), upload reports and JAR; security scan profile; optional image build tar and push to GHCR.
  - `deploy.yml`: example pipeline that builds, pushes to Docker Hub, bumps `elasticbeanstalk/docker-compose.yaml`, and deploys to EB; posts Slack notifications.
- Deployment (Elastic Beanstalk)
  - `elasticbeanstalk/docker-compose.yaml` runs the container listening on 8080 inside and exposes 80 outside. Database settings are injected from EB’s `${RDS_*}` environment variables; set `SPRING_PROFILES_ACTIVE=dev` to use the corresponding properties.

## Notes for daily development
- Typical split dev: start backend on :8080 via `./mvnw spring-boot:run`, then `cd src/frontend && npm run dev` and browse http://localhost:5173 (Vite dev server proxies `/api`).
- For single JAR testing, build with `./mvnw clean package` and run the JAR; static assets are served from `/` and APIs from `/api/...`.
- To run against a local Postgres, use the `local` profile or set datasource env vars when running the app or container.
