package com.quizflow.repository

import com.quizflow.domain.Quiz
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface QuizRepository : JpaRepository<Quiz, UUID> {
    fun findByCreatedById(userId: UUID): List<Quiz>
}
