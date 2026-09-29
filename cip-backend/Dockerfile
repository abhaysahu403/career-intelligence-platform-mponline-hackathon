# ═══════════════════════════════════════════════════════════════════════════
# Multi-service build for all backend microservices
# ═══════════════════════════════════════════════════════════════════════════

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copy parent POM and common-lib first
COPY pom.xml .
COPY common-lib ./common-lib

# Copy all service modules
COPY api-gateway ./api-gateway
COPY auth-service ./auth-service
COPY student-service ./student-service
COPY interview-service ./interview-service
COPY resume-service ./resume-service
COPY certificate-service ./certificate-service
COPY job-service ./job-service
COPY recommendation-service ./recommendation-service
COPY score-service ./score-service
COPY analytics-service ./analytics-service

# Build all at once (faster, resolves dependencies)
RUN mvn clean package -DskipTests -T 4

# ═══════════════════════════════════════════════════════════════════════════
# Individual service images
# ═══════════════════════════════════════════════════════════════════════════

# API Gateway
FROM eclipse-temurin:17-jre-alpine AS api-gateway
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /workspace/api-gateway/target/*.jar app.jar
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=docker
ENTRYPOINT ["java", "-jar", "app.jar"]

# Auth Service
FROM eclipse-temurin:17-jre-alpine AS auth-service
WORKDIR /app
COPY --from=build /workspace/auth-service/target/*.jar app.jar
EXPOSE 8081
ENV SPRING_PROFILES_ACTIVE=docker
ENTRYPOINT ["java", "-jar", "app.jar"]

# Student Service
FROM eclipse-temurin:17-jre-alpine AS student-service
WORKDIR /app
COPY --from=build /workspace/student-service/target/*.jar app.jar
EXPOSE 8082
ENV SPRING_PROFILES_ACTIVE=docker
ENTRYPOINT ["java", "-jar", "app.jar"]

# Interview Service
FROM eclipse-temurin:17-jre-alpine AS interview-service
WORKDIR /app
COPY --from=build /workspace/interview-service/target/*.jar app.jar
EXPOSE 8083
ENV SPRING_PROFILES_ACTIVE=docker
ENTRYPOINT ["java", "-jar", "app.jar"]

# Resume Service
FROM eclipse-temurin:17-jre-alpine AS resume-service
WORKDIR /app
COPY --from=build /workspace/resume-service/target/*.jar app.jar
EXPOSE 8084
ENV SPRING_PROFILES_ACTIVE=docker
ENTRYPOINT ["java", "-jar", "app.jar"]

# Certificate Service
FROM eclipse-temurin:17-jre-alpine AS certificate-service
WORKDIR /app
COPY --from=build /workspace/certificate-service/target/*.jar app.jar
EXPOSE 8085
ENV SPRING_PROFILES_ACTIVE=docker
ENTRYPOINT ["java", "-jar", "app.jar"]

# Job Service
FROM eclipse-temurin:17-jre-alpine AS job-service
WORKDIR /app
COPY --from=build /workspace/job-service/target/*.jar app.jar
EXPOSE 8086
ENV SPRING_PROFILES_ACTIVE=docker
ENTRYPOINT ["java", "-jar", "app.jar"]

# Recommendation Service
FROM eclipse-temurin:17-jre-alpine AS recommendation-service
WORKDIR /app
COPY --from=build /workspace/recommendation-service/target/*.jar app.jar
EXPOSE 8087
ENV SPRING_PROFILES_ACTIVE=docker
ENTRYPOINT ["java", "-jar", "app.jar"]

# Score Service
FROM eclipse-temurin:17-jre-alpine AS score-service
WORKDIR /app
COPY --from=build /workspace/score-service/target/*.jar app.jar
EXPOSE 8088
ENV SPRING_PROFILES_ACTIVE=docker
ENTRYPOINT ["java", "-jar", "app.jar"]

# Analytics Service
FROM eclipse-temurin:17-jre-alpine AS analytics-service
WORKDIR /app
COPY --from=build /workspace/analytics-service/target/*.jar app.jar
EXPOSE 8089
ENV SPRING_PROFILES_ACTIVE=docker
ENTRYPOINT ["java", "-jar", "app.jar"]
