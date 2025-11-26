./mvnw clean install -P springboot-react-fullstack:local -P jib-build-local-docker-image -Dapp.image.tag=local
docker run --name fullstack -p 8080:8080 \
   -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/syscomz \
   -e SPRING_DATASOURCE_USERNAME=postgres \
   -e SPRING_DATASOURCE_PASSWORD=top2gun6 \
  springboot-react-fullstack:local#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="springboot-react-fullstack"
IMAGE_TAG="local"
FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"
DB_URL="jdbc:postgresql://host.docker.internal:5555/syscomz"
DB_USER="postgres"
DB_PASS="password"

echo "==> Checking Docker daemon"
docker info >/dev/null || { echo "Docker not running"; exit 1; }

echo "==> Building image with Jib (profiles: bundle-backend-and-frontend + jib-build-local-docker-image)"
./mvnw -q clean install -P bundle-backend-and-frontend -P jib-build-local-docker-image -Dapp.image.tag="${IMAGE_TAG}" || {
  echo "Maven build failed"; exit 1;
}

echo "==> Verifying image exists"
if ! docker images --format '{{.Repository}}:{{.Tag}}' | grep -q "^${FULL_IMAGE}$"; then
  echo "Image ${FULL_IMAGE} not found after Jib build. Fallback: Dockerfile build."
  if [ ! -f Dockerfile ]; then
    cat > Dockerfile <<'EOF'
FROM eclipse-temurin:21-jre-alpine
ARG JAR_FILE=target/*SNAPSHOT.jar
COPY ${JAR_FILE} app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]
EOF
    echo "Created Dockerfile (simple fallback)."
  fi
  ./mvnw -q clean package -P bundle-backend-and-frontend -DskipTests
  docker build -t "${FULL_IMAGE}" .
fi

echo "==> Removing any existing container"
docker rm -f fullstack >/dev/null 2>&1 || true

echo "==> Running container ${FULL_IMAGE}"
docker run --name fullstack -d -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="${DB_URL}" \
  -e SPRING_DATASOURCE_USERNAME="${DB_USER}" \
  -e SPRING_DATASOURCE_PASSWORD="${DB_PASS}" \
  "${FULL_IMAGE}"

echo "==> Waiting for app (health probe)"
RETRIES=30
until curl -sf http://localhost:8080/actuator/health | grep -q UP; do
  ((RETRIES--)) || { echo "App did not start in time"; docker logs fullstack | tail -n 50; exit 1; }
  sleep 2
done

echo "==> Health: OK"
echo "==> Sample API check"
curl -sf http://localhost:8080/api/v1/students | head -c 300 || echo "Students endpoint not reachable"

echo "==> Done. Logs (tail):"
docker logs --tail 40 fullstack