# Multi-stage Dockerfile for OmniStay ERP Backend Microservice

# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Production Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S omnistay && adduser -S omnistay -G omnistay
USER omnistay:omnistay

COPY --from=build /app/target/omnistay-erp-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
