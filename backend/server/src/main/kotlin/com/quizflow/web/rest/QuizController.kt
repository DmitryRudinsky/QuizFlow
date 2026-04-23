package com.quizflow.web.rest

import com.quizflow.api.request.AddQuestionRequest
import com.quizflow.api.request.CreateQuizRequest
import com.quizflow.api.request.UpdateQuizRequest
import com.quizflow.api.response.QuizDetailResponse
import com.quizflow.api.response.QuizResponse
import com.quizflow.domain.AnswerType
import com.quizflow.domain.QuestionType
import com.quizflow.domain.User
import com.quizflow.service.QuizService
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/quizzes")
@Transactional
class QuizController(
    private val quizService: QuizService,
) {
    @GetMapping("/{id}")
    fun getQuiz(@PathVariable id: UUID): QuizDetailResponse =
        quizService.getQuiz(id).toDetailResponse()

    @GetMapping
    fun getQuizzesByUser(@AuthenticationPrincipal user: User): List<QuizResponse> =
        quizService.getQuizzesByUser(user.id!!).map { it.toResponse() }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createQuiz(
        @AuthenticationPrincipal user: User,
        @RequestBody request: CreateQuizRequest,
    ): QuizDetailResponse = quizService.createQuiz(
        userId = user.id!!,
        title = request.title,
        description = request.description,
        category = request.category,
    ).toDetailResponse()

    @PutMapping("/{id}")
    fun updateQuiz(
        @PathVariable id: UUID,
        @AuthenticationPrincipal user: User,
        @RequestBody request: UpdateQuizRequest,
    ): QuizDetailResponse = quizService.updateQuiz(
        userId = user.id!!,
        quizId = id,
        title = request.title,
        description = request.description,
        category = request.category,
    ).toDetailResponse()

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteQuiz(
        @PathVariable id: UUID,
        @AuthenticationPrincipal user: User,
    ) = quizService.deleteQuiz(userId = user.id!!, quizId = id)

    @PostMapping("/{id}/questions")
    @ResponseStatus(HttpStatus.CREATED)
    fun addQuestion(
        @PathVariable id: UUID,
        @AuthenticationPrincipal user: User,
        @RequestBody request: AddQuestionRequest,
    ): QuizDetailResponse = quizService.addQuestion(
        userId = user.id!!,
        quizId = id,
        questionText = request.questionText,
        type = QuestionType.valueOf(request.type.name),
        answerType = AnswerType.valueOf(request.answerType.name),
        timeLimit = request.timeLimit,
        points = request.points,
        answers = request.answers.map { it.text to it.isCorrect },
    ).toDetailResponse()
}
