package com.quizflow.api.response

import com.quizflow.api.model.AnswerTypeDto
import com.quizflow.api.model.QuestionTypeDto
import java.time.Instant
import java.util.UUID

data class QuizResponse(
    val id: UUID,
    val title: String,
    val description: String?,
    val category: String?,
    val createdBy: UUID,
    val questionCount: Int,
    val createdAt: Instant,
)

data class QuizDetailResponse(
    val id: UUID,
    val title: String,
    val description: String?,
    val category: String?,
    val createdBy: UUID,
    val questions: List<QuestionResponse>,
    val createdAt: Instant,
)

data class QuestionResponse(
    val id: UUID,
    val questionText: String,
    val type: QuestionTypeDto,
    val answerType: AnswerTypeDto,
    val timeLimit: Int,
    val points: Int,
    val position: Int,
    val answers: List<AnswerResponse>,
)

data class AnswerResponse(
    val id: UUID,
    val text: String,
)
