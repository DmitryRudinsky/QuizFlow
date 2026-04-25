package com.quizflow.repository

import com.quizflow.domain.Session
import com.quizflow.domain.SessionStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface SessionRepository : JpaRepository<Session, UUID> {
    fun findByRoomCode(roomCode: String): Session?

    @Query(
        "SELECT DISTINCT s FROM Session s " +
            "JOIN FETCH s.quiz q " +
            "LEFT JOIN FETCH q.questions " +
            "WHERE s.roomCode = :roomCode",
    )
    fun findByRoomCodeWithDetails(@Param("roomCode") roomCode: String): Session?

    fun findByHostIdAndStatus(hostId: UUID, status: SessionStatus): List<Session>
}
