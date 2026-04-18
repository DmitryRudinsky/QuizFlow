plugins {
    kotlin("plugin.spring")
    kotlin("plugin.jpa")
    id("org.springframework.boot")
    id("io.spring.dependency-management")
}

dependencies {
    // Зависимость на api-модуль — сервер знает о DTO
    implementation(project(":api"))

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

    // BCrypt для хеширования паролей (входит в Spring Security Crypto)
    implementation("org.springframework.security:spring-security-crypto")

    // Swagger UI + OpenAPI документация
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.6")

    // Тесты
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

// Читаем .env из корня репозитория и передаём переменные в bootRun
tasks.named<org.springframework.boot.gradle.tasks.run.BootRun>("bootRun") {
    val envFile = rootProject.projectDir.parentFile.resolve(".env")
    if (envFile.exists()) {
        envFile.readLines()
            .filter { it.isNotBlank() && !it.startsWith("#") && it.contains("=") }
            .forEach { line ->
                val (key, value) = line.split("=", limit = 2)
                environment(key.trim(), value.trim())
            }
    }
}
