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
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/sessions")
class SessionController(
    private val sessionService: SessionService,
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
    ): SessionResponse = sessionService.nextQuestion(user.id!!, roomCode).toResponse()

    @PostMapping("/{roomCode}/end")
    fun endSession(
        @PathVariable roomCode: String,
        @AuthenticationPrincipal user: User,
    ): SessionResponse = sessionService.endSession(user.id!!, roomCode).toResponse()

    @GetMapping("/{roomCode}/leaderboard")
    fun getLeaderboard(@PathVariable roomCode: String): List<LeaderboardEntryResponse> =
        sessionService.getLeaderboard(roomCode).toLeaderboard()
}
