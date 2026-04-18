package com.quizflow.api.request

import java.util.UUID

data class CreateSessionRequest(
    val quizId: UUID,
)

data class JoinSessionRequest(
    val nickname: String,
    val userId: UUID? = null,
)

data class SubmitAnswerRequest(
    val participantId: UUID,
    val questionId: UUID,
    val answerIds: List<UUID>,
)
