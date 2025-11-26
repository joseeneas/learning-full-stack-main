docker network create fullnet || true
docker network connect fullnet test-postgres
docker run --name fullstack --network fullnet -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://test-postgres:5432/syscomz \
  -e SPRING_DATASOURCE_USERNAME=eneas \
  -e SPRING_DATASOURCE_PASSWORD=top2gun6 \
  springboot-react-fullstack:local