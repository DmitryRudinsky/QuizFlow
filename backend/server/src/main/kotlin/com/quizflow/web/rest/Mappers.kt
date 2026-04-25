package com.quizflow.web.rest

import com.quizflow.api.model.AnswerTypeDto
import com.quizflow.api.model.QuestionTypeDto
import com.quizflow.api.model.SessionStatusDto
import com.quizflow.api.model.UserRoleDto
import com.quizflow.api.response.AnswerResponse
import com.quizflow.api.response.JoinSessionResponse
import com.quizflow.api.response.LeaderboardEntryResponse
import com.quizflow.api.response.QuestionResponse
import com.quizflow.api.response.QuizDetailResponse
import com.quizflow.api.response.QuizResponse
import com.quizflow.api.response.SessionResponse
import com.quizflow.api.response.UserResponse
import com.quizflow.domain.Answer
import com.quizflow.domain.Question
import com.quizflow.domain.Quiz
import com.quizflow.domain.Session
import com.quizflow.domain.SessionParticipant
import com.quizflow.domain.User

fun User.toResponse() = UserResponse(
    id = id!!,
    name = name,
    email = email,
    role = UserRoleDto.valueOf(role.name),
)

fun Quiz.toResponse() = QuizResponse(
    id = id!!,
    title = title,
    description = description,
    category = category,
    createdBy = createdBy.id!!,
    questionCount = questions.size,
    createdAt = createdAt,
)

fun Quiz.toDetailResponse() = QuizDetailResponse(
    id = id!!,
    title = title,
    description = description,
    category = category,
    createdBy = createdBy.id!!,
    questions = questions.map { it.toResponse() },
    createdAt = createdAt,
)

fun Question.toResponse() = QuestionResponse(
    id = id!!,
    questionText = questionText,
    type = QuestionTypeDto.valueOf(type.name),
    answerType = AnswerTypeDto.valueOf(answerType.name),
    timeLimit = timeLimit,
    points = points,
    position = position,
    answers = answers.map { it.toResponse() },
)

fun Answer.toResponse() = AnswerResponse(
    id = id!!,
    text = text,
)

fun Session.toResponse() = SessionResponse(
    id = id!!,
    roomCode = roomCode,
    quizId = quiz.id!!,
    hostId = host.id!!,
    status = SessionStatusDto.valueOf(status.name),
    currentQuestionIndex = currentQuestionIndex,
)

fun SessionParticipant.toJoinResponse() = JoinSessionResponse(
    participantId = id!!,
    nickname = nickname,
    sessionId = session.id!!,
    roomCode = session.roomCode,
)

fun List<Pair<SessionParticipant, Int>>.toLeaderboard() = mapIndexed { index, (participant, correctCount) ->
    LeaderboardEntryResponse(
        participantId = participant.id!!,
        nickname = participant.nickname,
        score = participant.score,
        rank = index + 1,
        correctCount = correctCount,
    )
}
