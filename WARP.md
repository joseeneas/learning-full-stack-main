# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## About this repo
Spring Boot (Java 21) backend + React (Vite) frontend. Maven bundles the frontend into the backend JAR (via frontend-maven-plugin + resources copy). Images are built with Jib. CI runs on GitHub Actions. Optional deployment targets AWS Elastic Beanstalk with a docker-compose that wires RDS env vars.

## Prerequisites
- Java 21 (Temurin recommended)
- Node.js ≥18 and npm
- Docker (for local Postgres and container runs)

## Common commands

Backend (Spring Boot)
- Run (default profile): `./mvnw spring-boot:run`
- Run with dev profile (e.g., RDS/alt DB): `SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run`
- Run with local profile: `./mvnw spring-boot:run -Dspring-boot.run.profiles=local`
- Package JAR (bundles FE via active default profile): `./mvnw clean package`
- Run packaged app: `java -jar target/spring-boot-full-stack-professional-0.0.1-SNAPSHOT.jar`

Testing (Maven)
- Unit tests only: `./mvnw test`
- Full suite (unit + integration): `./mvnw verify`
- Skip integration tests: `./mvnw -DskipITs=true verify`
- Run a single unit test: `./mvnw -Dtest=StudentServiceTest test`
- Run a single integration test: `./mvnw -Dit.test=StudentExportIT verify`
- Test reports: unit → `target/surefire-reports`, integration → `target/failsafe-reports`

Frontend (Vite)
- Dev server (proxies /api → :8080): `cd src/frontend && npm install && npm run dev`
- Production build (used by Maven bundling): `cd src/frontend && npm run build`
- Preview build locally: `cd src/frontend && npm run preview`
- Frontend tests (optional): `cd src/frontend && npm test`
  - Note: current test script uses react-scripts in a Vite app; treat FE tests as optional unless you migrate to Vitest or another runner.

Containers (Jib)
- Build local Docker image: `./mvnw clean install -P bundle-backend-and-frontend -P jib-build-local-docker-image -Dapp.image.tag=local`
- Run local image (macOS/Windows host DB):
  `docker run --name fullstack -p 8080:8080 \
   -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/syscomz \
   -e SPRING_DATASOURCE_USERNAME=<user> \
   -e SPRING_DATASOURCE_PASSWORD=<pass> \
   springboot-react-fullstack:local`
- Push to Docker Hub:
  `./mvnw clean install -P bundle-backend-and-frontend -P jib-build-docker-image-and-push-it-to-docker-hub -Dapp.image.tag=<tag>`

CI / GHCR
- Workflows: `.github/workflows/build.yml`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`.
- CI builds and tests on push/PR; also builds an OCI image tar and (on non-PR) pushes an image to GHCR (`ghcr.io/<owner>/springboot-react-fullstack:<sha>` and `:latest`).

Elastic Beanstalk (optional)
- Upload `elasticbeanstalk/docker-compose.yaml` in the EB console. The compose file reads `${RDS_*}` envs provided by EB and maps container 8080 → host 80.

## High-level architecture

Backend (Spring Boot)
- Package root: `com.syscomz.springbootfullstackprofessional` with layered design:
  - Controller: REST under `student/` (e.g., `StudentController`)
  - Service: business logic in `StudentService`
  - Repository: Spring Data JPA repos (e.g., `StudentRepository`)
- Data & migrations: PostgreSQL at runtime; Flyway migrations in `src/main/resources/db/migration/` (baseline enabled). Integration tests use H2 in PostgreSQL mode.
- CORS: `CorsConfig` applies `app.cors.origins` to `/api/**` (include `http://localhost:5173` for Vite dev).
- Security: `SecurityConfig` disables CSRF and permits requests (public API by default).
- Actuator: health/info/metrics exposed for smoke checks.
- Config: `application.properties`, plus `application-dev.properties` and `application-local.properties` for profiles.

Frontend (React + Vite)
- Lives in `src/frontend`. `vite.config.js` proxies `/api` → `http://localhost:8080` and outputs to `build/`.
- During `mvn package`, `frontend-maven-plugin` builds the FE and `maven-resources-plugin` copies `build/` into `target/classes/static`, so the JAR serves the FE at `/` and APIs under `/api/**`.

Build & Images
- Maven profiles:
  - `bundle-backend-and-frontend` (active by default): builds FE and bundles into the JAR.
  - `jib-build-local-docker-image`: builds a local image `springboot-react-fullstack:<tag>`.
  - `jib-build-docker-image-and-push-it-to-docker-hub`: pushes `joseeneassilva/<image>:<tag>` and `:latest`.
- Jib base: `eclipse-temurin:21-jre`; container exposes port 8080.

Linting
- No lint step is enforced yet. If you want linting, add a `lint` script in `src/frontend/package.json` and wire it into CI; otherwise ignore.

Daily dev flow
- Terminal A: `./mvnw spring-boot:run`
- Terminal B: `cd src/frontend && npm run dev`
- Browse http://localhost:5173 (Vite proxies `/api` to http://localhost:8080)
