package com.quizflow.web.ws.messages

import java.util.UUID

data class AnswerSubmitMessage(
    val participantId: UUID,
    val questionId: UUID,
    val answerIds: List<UUID>,
)

data class AnswerResultMessage(
    val isCorrect: Boolean,
    val pointsEarned: Int,
    val totalScore: Int,
    val correctAnswerIds: List<UUID>,
)
