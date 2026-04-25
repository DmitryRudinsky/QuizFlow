package com.quizflow.api.response

import com.quizflow.api.model.SessionStatusDto
import java.util.UUID

data class SessionResponse(
    val id: UUID,
    val roomCode: String,
    val quizId: UUID,
    val hostId: UUID,
    val status: SessionStatusDto,
    val currentQuestionIndex: Int,
)

data class JoinSessionResponse(
    val participantId: UUID,
    val nickname: String,
    val sessionId: UUID,
    val roomCode: String,
)

data class AnswerResultResponse(
    val isCorrect: Boolean,
    val pointsEarned: Int,
    val correctAnswerIds: List<UUID>,
)

data class LeaderboardEntryResponse(
    val participantId: UUID,
    val nickname: String,
    val score: Int,
    val rank: Int,
    val correctCount: Int,
)
