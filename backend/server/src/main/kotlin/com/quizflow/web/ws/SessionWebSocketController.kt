package com.quizflow.web.ws

import com.quizflow.service.SessionService
import com.quizflow.web.ws.messages.AnswerOption
import com.quizflow.web.ws.messages.AnswerResultMessage
import com.quizflow.web.ws.messages.AnswerSubmitMessage
import com.quizflow.web.ws.messages.EventType
import com.quizflow.web.ws.messages.QuestionPayload
import com.quizflow.web.ws.messages.SessionCommand
import com.quizflow.web.ws.messages.SessionCommandType
import com.quizflow.web.ws.messages.SessionEvent
import org.springframework.messaging.handler.annotation.DestinationVariable
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Controller
import org.springframework.transaction.annotation.Transactional

@Controller
@Transactional
class SessionWebSocketController(
    private val sessionService: SessionService,
    private val messaging: SimpMessagingTemplate,
) {
    @MessageMapping("/session/{roomCode}/answer")
    fun submitAnswer(
        @DestinationVariable roomCode: String,
        @Payload message: AnswerSubmitMessage,
    ) {
        val answer = sessionService.submitAnswer(
            participantId = message.participantId,
            questionId = message.questionId,
            answerIds = message.answerIds,
        )

        val session = sessionService.getSessionByRoomCode(roomCode)
        val question = session.quiz.questions.find { it.id == message.questionId }!!
        val correctAnswerIds = question.answers.filter { it.isCorrect }.map { it.id!! }

        val participant = answer.participant

        messaging.convertAndSendToUser(
            message.participantId.toString(),
            "/queue/result",
            AnswerResultMessage(
                isCorrect = answer.isCorrect,
                pointsEarned = answer.pointsEarned,
                totalScore = participant.score,
                correctAnswerIds = correctAnswerIds,
            ),
        )
    }

    @MessageMapping("/session/{roomCode}/control")
    fun control(
        @DestinationVariable roomCode: String,
        @Payload command: SessionCommand,
    ) {
        when (command.type) {
            SessionCommandType.NEXT -> handleNext(roomCode, command)
            SessionCommandType.END -> handleEnd(roomCode, command)
        }
    }

    private fun handleNext(roomCode: String, command: SessionCommand) {
        val session = sessionService.nextQuestion(command.hostId, roomCode)
        val index = session.currentQuestionIndex

        if (index >= session.quiz.questions.size) {
            sessionService.endSession(command.hostId, roomCode)
            messaging.convertAndSend(
                "/topic/session/$roomCode",
                SessionEvent(type = EventType.SESSION_ENDED, payload = "Quiz finished"),
            )
            return
        }

        val question = session.quiz.questions[index]

        val payload = QuestionPayload(
            questionIndex = index,
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
    }

    private fun handleEnd(roomCode: String, command: SessionCommand) {
        sessionService.endSession(command.hostId, roomCode)

        messaging.convertAndSend(
            "/topic/session/$roomCode",
            SessionEvent(type = EventType.SESSION_ENDED, payload = "Session ended by host"),
        )
    }
}
