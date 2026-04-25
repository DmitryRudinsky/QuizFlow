package com.quizflow.repository

import com.quizflow.domain.ParticipantAnswer
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ParticipantAnswerRepository : JpaRepository<ParticipantAnswer, UUID> {
    fun findByParticipantId(participantId: UUID): List<ParticipantAnswer>
    fun existsByParticipantIdAndQuestionId(participantId: UUID, questionId: UUID): Boolean
    fun findByQuestionIdAndParticipantSessionId(questionId: UUID, sessionId: UUID): List<ParticipantAnswer>
    fun countByParticipantIdAndIsCorrectTrue(participantId: UUID): Long
}
