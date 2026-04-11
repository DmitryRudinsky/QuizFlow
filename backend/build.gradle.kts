plugins {
    kotlin("jvm") version "2.1.20"
    kotlin("plugin.spring") version "2.1.20"
    kotlin("plugin.jpa") version "2.1.20"
    id("org.springframework.boot") version "3.4.4"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.quizflow"
version = "0.0.1-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    // HTTP-сервер и REST API
    implementation("org.springframework.boot:spring-boot-starter-web")

    // ORM: работа с БД через классы
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")

    // WebSocket + STOMP
    implementation("org.springframework.boot:spring-boot-starter-websocket")

    // Валидация входящих данных (@NotBlank, @Size и т.д.)
    implementation("org.springframework.boot:spring-boot-starter-validation")

    // JDBC-драйвер PostgreSQL (только runtime)
    runtimeOnly("org.postgresql:postgresql")

    // Миграции БД
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")

    // Kotlin: JSON-сериализация data class'ов
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

    // Kotlin: reflection для Spring
    implementation("org.jetbrains.kotlin:kotlin-reflect")

    // Тесты
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_21)
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}

tasks.withType<JavaCompile> {
    sourceCompatibility = "21"
    targetCompatibility = "21"
}

tasks.withType<Test> {
    useJUnitPlatform()
}
