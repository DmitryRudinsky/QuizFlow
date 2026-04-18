package com.quizflow.repository

import com.quizflow.domain.Session
import com.quizflow.domain.SessionStatus
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SessionRepository : JpaRepository<Session, UUID> {
    fun findByRoomCode(roomCode: String): Session?
    fun findByHostIdAndStatus(hostId: UUID, status: SessionStatus): List<Session>
}
