package com.quizflow.repository

import com.quizflow.domain.SessionParticipant
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SessionParticipantRepository : JpaRepository<SessionParticipant, UUID> {
    fun findBySessionId(sessionId: UUID): List<SessionParticipant>
    fun findBySessionIdAndUserId(sessionId: UUID, userId: UUID): SessionParticipant?
}
