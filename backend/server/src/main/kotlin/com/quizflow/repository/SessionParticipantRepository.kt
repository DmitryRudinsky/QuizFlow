package com.quizflow.repository

import com.quizflow.domain.SessionParticipant
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface SessionParticipantRepository : JpaRepository<SessionParticipant, UUID> {
    fun findBySessionId(sessionId: UUID): List<SessionParticipant>
    fun findBySessionIdAndUserId(sessionId: UUID, userId: UUID): SessionParticipant?

    @Query(
        "SELECT DISTINCT sp FROM SessionParticipant sp " +
            "JOIN FETCH sp.session s " +
            "LEFT JOIN FETCH s.participants " +
            "JOIN FETCH s.quiz " +
            "WHERE sp.user.id = :userId",
    )
    fun findByUserIdWithSession(@Param("userId") userId: UUID): List<SessionParticipant>
}
