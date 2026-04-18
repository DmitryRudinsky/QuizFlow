FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY gradle gradle
COPY gradlew .
COPY settings.gradle.kts .
COPY build.gradle.kts .
COPY api/build.gradle.kts api/build.gradle.kts
COPY server/build.gradle.kts server/build.gradle.kts

RUN ./gradlew dependencies --no-daemon -q

COPY api/src api/src
COPY server/src server/src

RUN ./gradlew :server:bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/server/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
