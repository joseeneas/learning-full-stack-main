# Makefile for common developer tasks

SHELL := /bin/bash
.DEFAULT_GOAL := help

MVNW := ./mvnw
FRONTEND_DIR := src/frontend
APP_JAR := target/spring-boot-full-stack-professional-0.0.1-SNAPSHOT.jar
IMAGE_NAME := springboot-react-fullstack
IMAGE_TAG ?= local

.PHONY: help dev dev-backend dev-frontend test verify test-one it-one package run-jar \
	docker-build-local docker-run-local docker-stop fe-build fe-preview fe-test security-scan

help: ## Show available targets
	@echo "Common targets:" && \
	awk 'BEGIN {FS = ":.*?# "} /^[a-zA-Z0-9_-]+:.*?# / {printf "  %-22s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# --- Development ---

dev-backend: ## Run Spring Boot backend on :8080
	$(MVNW) spring-boot:run

dev-frontend: ## Run Vite dev server on :5173 (proxies /api -> :8080)
	cd $(FRONTEND_DIR) && npm install && npm run dev

dev: ## Run backend and frontend concurrently (Ctrl-C stops both)
	@bash -lc 'set -euo pipefail; trap "trap - SIGINT SIGTERM EXIT; kill 0" SIGINT SIGTERM EXIT; \
	  (cd $(FRONTEND_DIR) && npm install && npm run dev) & \
	  ($(MVNW) spring-boot:run)'

# --- Testing ---

test: ## Run unit tests
	$(MVNW) test

verify: ## Run full test suite (unit + integration)
	$(MVNW) clean verify

# Usage: make test-one TEST=StudentServiceTest
test-one: ## Run a single unit test (TEST=ClassName)
	@if [ -z "$(TEST)" ]; then echo "Usage: make test-one TEST=ClassName"; exit 2; fi
	$(MVNW) -Dtest=$(TEST) test

# Usage: make it-one IT=StudentExportIT
it-one: ## Run a single integration test (IT=ClassName)
	@if [ -z "$(IT)" ]; then echo "Usage: make it-one IT=ClassName"; exit 2; fi
	$(MVNW) -Dit.test=$(IT) verify

# --- Build & Run ---

package: ## Build JAR (bundles frontend into the JAR)
	$(MVNW) clean package

run-jar: ## Run the packaged application
	java -jar $(APP_JAR)

# --- Containers (Jib) ---

docker-build-local: ## Build local Docker image with Jib (IMAGE_TAG?=$(IMAGE_TAG))
	$(MVNW) clean install -P bundle-backend-and-frontend -P jib-build-local-docker-image -Dapp.image.tag=$(IMAGE_TAG)

# Adjust DB envs as needed; defaults assume host Postgres on :5432
# Example: make docker-run-local IMAGE_TAG=local

docker-run-local: ## Run local Docker image on :8080 (connects to host Postgres)
	docker run --name fullstack -p 8080:8080 \
	  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/syscomz \
	  -e SPRING_DATASOURCE_USERNAME=postgres \
	  -e SPRING_DATASOURCE_PASSWORD=password \
	  $(IMAGE_NAME):$(IMAGE_TAG)

docker-stop: ## Stop and remove the running container named "fullstack"
	-@docker rm -f fullstack 2>/dev/null || true

# --- Frontend convenience ---

fe-build: ## Production build of the frontend (Vite)
	cd $(FRONTEND_DIR) && npm install && npm run build

fe-preview: ## Preview the built frontend locally
	cd $(FRONTEND_DIR) && npm run preview

fe-test: ## Run frontend tests (optional; react-scripts in a Vite app)
	cd $(FRONTEND_DIR) && npm test

# --- Security ---

security-scan: ## Run OWASP Dependency-Check + CycloneDX (set NVD_API_KEY for faster updates)
	$(MVNW) -B -P security-scan clean verify || true
