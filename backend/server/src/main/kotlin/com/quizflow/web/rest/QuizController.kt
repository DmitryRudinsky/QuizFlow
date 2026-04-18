package com.quizflow.web.rest

import com.quizflow.api.request.AddQuestionRequest
import com.quizflow.api.request.CreateQuizRequest
import com.quizflow.api.request.UpdateQuizRequest
import com.quizflow.api.response.QuizDetailResponse
import com.quizflow.api.response.QuizResponse
import com.quizflow.domain.AnswerType
import com.quizflow.domain.QuestionType
import com.quizflow.service.QuizService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/quizzes")
class QuizController(
    private val quizService: QuizService,
) {
    @GetMapping("/{id}")
    fun getQuiz(@PathVariable id: UUID): QuizDetailResponse {
        return quizService.getQuiz(id).toDetailResponse()
    }

    @GetMapping
    fun getQuizzesByUser(@RequestParam userId: UUID): List<QuizResponse> {
        return quizService.getQuizzesByUser(userId).map { it.toResponse() }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createQuiz(
        @RequestParam userId: UUID,
        @RequestBody request: CreateQuizRequest,
    ): QuizDetailResponse {
        return quizService.createQuiz(
            userId = userId,
            title = request.title,
            description = request.description,
            category = request.category,
        ).toDetailResponse()
    }

    @PutMapping("/{id}")
    fun updateQuiz(
        @PathVariable id: UUID,
        @RequestParam userId: UUID,
        @RequestBody request: UpdateQuizRequest,
    ): QuizDetailResponse {
        return quizService.updateQuiz(
            userId = userId,
            quizId = id,
            title = request.title,
            description = request.description,
            category = request.category,
        ).toDetailResponse()
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteQuiz(
        @PathVariable id: UUID,
        @RequestParam userId: UUID,
    ) {
        quizService.deleteQuiz(userId = userId, quizId = id)
    }

    @PostMapping("/{id}/questions")
    @ResponseStatus(HttpStatus.CREATED)
    fun addQuestion(
        @PathVariable id: UUID,
        @RequestParam userId: UUID,
        @RequestBody request: AddQuestionRequest,
    ): QuizDetailResponse {
        return quizService.addQuestion(
            userId = userId,
            quizId = id,
            questionText = request.questionText,
            type = QuestionType.valueOf(request.type.name),
            answerType = AnswerType.valueOf(request.answerType.name),
            timeLimit = request.timeLimit,
            points = request.points,
            answers = request.answers.map { it.text to it.isCorrect },
        ).toDetailResponse()
    }
}
