package com.quizflow.web.ws.messages

import java.util.UUID

enum class EventType {
    QUESTION_STARTED,
    QUESTION_ENDED,
    ANSWER_SUBMITTED,
    SESSION_PAUSED,
    SESSION_RESUMED,
    SESSION_ENDED,
}

data class SessionEvent(
    val type: EventType,
    val payload: Any,
)

data class QuestionPayload(
    val questionIndex: Int,
    val totalQuestions: Int,
    val questionId: UUID,
    val questionText: String,
    val answers: List<AnswerOption>,
    val timeLimit: Int,
    val points: Int,
)

data class AnswerOption(
    val id: UUID,
    val text: String,
)

data class AnswerStatsPayload(
    val questionId: UUID,
    val participantId: UUID,
    val stats: Map<String, Int>,
)
