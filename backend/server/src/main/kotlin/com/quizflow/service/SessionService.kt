package com.quizflow.service

import com.quizflow.domain.Session
import com.quizflow.domain.SessionParticipant
import com.quizflow.domain.SessionStatus
import com.quizflow.exception.AccessDeniedException
import com.quizflow.exception.AlreadyAnsweredException
import com.quizflow.exception.AlreadyJoinedException
import com.quizflow.exception.NotFoundException
import com.quizflow.exception.SessionAlreadyStartedException
import com.quizflow.exception.SessionNotActiveException
import com.quizflow.repository.ParticipantAnswerRepository
import com.quizflow.repository.SessionParticipantRepository
import com.quizflow.repository.SessionRepository
import com.quizflow.repository.UserRepository
import com.quizflow.domain.ParticipantAnswer
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class SessionService(
    private val sessionRepository: SessionRepository,
    private val sessionParticipantRepository: SessionParticipantRepository,
    private val participantAnswerRepository: ParticipantAnswerRepository,
    private val userRepository: UserRepository,
    private val quizService: QuizService,
) {
    fun createSession(hostId: UUID, quizId: UUID): Session {
        val host = userRepository.findById(hostId)
            .orElseThrow { NotFoundException("User", hostId) }

        val quiz = quizService.getQuiz(quizId)

        val session = Session(
            roomCode = generateRoomCode(),
            quiz = quiz,
            host = host,
        )

        return sessionRepository.save(session)
    }

    fun startSession(hostId: UUID, roomCode: String): Session {
        val session = getSessionByRoomCode(roomCode)

        if (session.host.id != hostId) {
            throw AccessDeniedException("Only the host can start the session")
        }

        if (session.status != SessionStatus.waiting) {
            throw SessionAlreadyStartedException(roomCode)
        }

        session.status = SessionStatus.active
        session.startedAt = Instant.now()

        return sessionRepository.save(session)
    }

    fun joinSession(roomCode: String, userId: UUID?, nickname: String): SessionParticipant {
        val session = getSessionByRoomCode(roomCode)

        if (session.status == SessionStatus.ended) {
            throw SessionNotActiveException(roomCode)
        }

        if (userId != null) {
            val existing = sessionParticipantRepository.findBySessionIdAndUserId(session.id!!, userId)
            if (existing != null) {
                throw AlreadyJoinedException()
            }
        }

        val user = userId?.let {
            userRepository.findById(it).orElseThrow { NotFoundException("User", it) }
        }

        val participant = SessionParticipant(
            session = session,
            user = user,
            nickname = nickname,
        )

        return sessionParticipantRepository.save(participant)
    }

    fun submitAnswer(participantId: UUID, questionId: UUID, answerIds: List<UUID>): ParticipantAnswer {
        val participant = sessionParticipantRepository.findById(participantId)
            .orElseThrow { NotFoundException("Participant", participantId) }

        val session = participant.session

        if (session.status != SessionStatus.active) {
            throw SessionNotActiveException(session.roomCode)
        }

        if (participantAnswerRepository.existsByParticipantIdAndQuestionId(participantId, questionId)) {
            throw AlreadyAnsweredException()
        }

        val question = session.quiz.questions
            .find { it.id == questionId }
            ?: throw NotFoundException("Question", questionId)

        val correctIds = question.answers.filter { it.isCorrect }.map { it.id }.toSet()
        val submittedIds = answerIds.toSet()

        val isCorrect = correctIds == submittedIds

        val pointsEarned = if (isCorrect) question.points else 0

        if (isCorrect) {
            participant.score += pointsEarned
            sessionParticipantRepository.save(participant)
        }

        val answer = ParticipantAnswer(
            participant = participant,
            question = question,
            answerIds = answerIds.toTypedArray(),
            isCorrect = isCorrect,
            pointsEarned = pointsEarned,
        )

        return participantAnswerRepository.save(answer)
    }

    fun nextQuestion(hostId: UUID, roomCode: String): Session {
        val session = getSessionByRoomCode(roomCode)

        if (session.host.id != hostId) {
            throw AccessDeniedException("Only the host can control the session")
        }

        if (session.status != SessionStatus.active) {
            throw SessionNotActiveException(roomCode)
        }

        session.currentQuestionIndex += 1

        return sessionRepository.save(session)
    }

    fun endSession(hostId: UUID, roomCode: String): Session {
        val session = getSessionByRoomCode(roomCode)

        if (session.host.id != hostId) {
            throw AccessDeniedException("Only the host can end the session")
        }

        session.status = SessionStatus.ended
        session.endedAt = Instant.now()

        return sessionRepository.save(session)
    }

    fun getLeaderboard(roomCode: String): List<SessionParticipant> {
        val session = getSessionByRoomCode(roomCode)
        return sessionParticipantRepository.findBySessionId(session.id!!)
            .sortedByDescending { it.score }
    }

    fun getLeaderboardWithCounts(roomCode: String): List<Pair<SessionParticipant, Int>> {
        return getLeaderboard(roomCode).map { p ->
            p to participantAnswerRepository.countByParticipantIdAndIsCorrectTrue(p.id!!).toInt()
        }
    }

    fun getAnswerStats(roomCode: String, questionId: UUID): Map<String, Int> {
        val session = getSessionByRoomCode(roomCode)
        val answers = participantAnswerRepository
            .findByQuestionIdAndParticipantSessionId(questionId, session.id!!)
        val total = answers.size
        if (total == 0) return emptyMap()
        val counts = mutableMapOf<String, Int>()
        for (a in answers) {
            for (answerId in a.answerIds) {
                val key = answerId.toString()
                counts[key] = (counts[key] ?: 0) + 1
            }
        }
        return counts.mapValues { (_, count) -> (count * 100) / total }
    }

    fun getSessionByRoomCode(roomCode: String): Session {
        return sessionRepository.findByRoomCode(roomCode)
            ?: throw NotFoundException("Session", roomCode)
    }

    fun getSessionByRoomCodeWithDetails(roomCode: String): Session {
        return sessionRepository.findByRoomCodeWithDetails(roomCode)
            ?: throw NotFoundException("Session", roomCode)
    }

    private fun generateRoomCode(): String {
        val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        return (1..6).map { chars.random() }.joinToString("")
    }
}
