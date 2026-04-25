package com.quizflow.web.rest

import com.quizflow.api.request.CreateSessionRequest
import com.quizflow.api.request.JoinSessionRequest
import com.quizflow.api.request.SubmitAnswerRequest
import com.quizflow.api.response.AnswerResultResponse
import com.quizflow.api.response.JoinSessionResponse
import com.quizflow.api.response.LeaderboardEntryResponse
import com.quizflow.api.response.SessionResponse
import com.quizflow.domain.User
import com.quizflow.service.SessionService
import com.quizflow.web.ws.messages.AnswerOption
import com.quizflow.web.ws.messages.EventType
import com.quizflow.web.ws.messages.QuestionPayload
import com.quizflow.web.ws.messages.SessionEvent
import org.springframework.http.HttpStatus
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/sessions")
@Transactional
class SessionController(
    private val sessionService: SessionService,
    private val messaging: SimpMessagingTemplate,
) {
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createSession(
        @AuthenticationPrincipal user: User,
        @RequestBody request: CreateSessionRequest,
    ): SessionResponse = sessionService.createSession(user.id!!, request.quizId).toResponse()

    @GetMapping("/{roomCode}")
    fun getSession(@PathVariable roomCode: String): SessionResponse =
        sessionService.getSessionByRoomCode(roomCode).toResponse()

    @PostMapping("/{roomCode}/start")
    fun startSession(
        @PathVariable roomCode: String,
        @AuthenticationPrincipal user: User,
    ): SessionResponse = sessionService.startSession(user.id!!, roomCode).toResponse()

    @PostMapping("/{roomCode}/join")
    @ResponseStatus(HttpStatus.CREATED)
    fun joinSession(
        @PathVariable roomCode: String,
        @AuthenticationPrincipal user: User?,
        @RequestBody request: JoinSessionRequest,
    ): JoinSessionResponse = sessionService.joinSession(roomCode, user?.id, request.nickname).toJoinResponse()

    @PostMapping("/{roomCode}/answer")
    fun submitAnswer(
        @PathVariable roomCode: String,
        @RequestBody request: SubmitAnswerRequest,
    ): AnswerResultResponse {
        val answer = sessionService.submitAnswer(request.participantId, request.questionId, request.answerIds)
        val correctAnswerIds = sessionService.getSessionByRoomCode(roomCode).quiz.questions
            .find { it.id == request.questionId }!!
            .answers.filter { it.isCorrect }.map { it.id!! }

        return AnswerResultResponse(
            isCorrect = answer.isCorrect,
            pointsEarned = answer.pointsEarned,
            correctAnswerIds = correctAnswerIds,
        )
    }

    @PostMapping("/{roomCode}/next")
    fun nextQuestion(
        @PathVariable roomCode: String,
        @AuthenticationPrincipal user: User,
    ): SessionResponse {
        val session = sessionService.nextQuestion(user.id!!, roomCode)
        val questionIndex = session.currentQuestionIndex - 1

        if (questionIndex >= session.quiz.questions.size) {
            sessionService.endSession(user.id!!, roomCode)
            messaging.convertAndSend(
                "/topic/session/$roomCode",
                SessionEvent(type = EventType.SESSION_ENDED, payload = "Quiz finished"),
            )
            return session.toResponse()
        }

        val question = session.quiz.questions[questionIndex]
        val payload = QuestionPayload(
            questionIndex = questionIndex,
            totalQuestions = session.quiz.questions.size,
            questionId = question.id!!,
            questionText = question.questionText,
            answers = question.answers.map { AnswerOption(id = it.id!!, text = it.text) },
            timeLimit = question.timeLimit,
            points = question.points,
        )
        messaging.convertAndSend(
            "/topic/session/$roomCode",
            SessionEvent(type = EventType.QUESTION_STARTED, payload = payload),
        )
        return session.toResponse()
    }

    @PostMapping("/{roomCode}/end")
    fun endSession(
        @PathVariable roomCode: String,
        @AuthenticationPrincipal user: User,
    ): SessionResponse {
        val session = sessionService.endSession(user.id!!, roomCode)
        messaging.convertAndSend(
            "/topic/session/$roomCode",
            SessionEvent(type = EventType.SESSION_ENDED, payload = "Session ended by host"),
        )
        return session.toResponse()
    }

    @GetMapping("/{roomCode}/leaderboard")
    fun getLeaderboard(@PathVariable roomCode: String): List<LeaderboardEntryResponse> =
        sessionService.getLeaderboard(roomCode).toLeaderboard()
}
