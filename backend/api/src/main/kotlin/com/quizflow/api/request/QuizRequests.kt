package com.quizflow.api.request

import com.quizflow.api.model.AnswerTypeDto
import com.quizflow.api.model.QuestionTypeDto

data class CreateQuizRequest(
    val title: String,
    val description: String? = null,
    val category: String? = null,
)

data class UpdateQuizRequest(
    val title: String? = null,
    val description: String? = null,
    val category: String? = null,
)

data class AddQuestionRequest(
    val questionText: String,
    val type: QuestionTypeDto = QuestionTypeDto.text,
    val answerType: AnswerTypeDto = AnswerTypeDto.single,
    val timeLimit: Int = 30,
    val points: Int = 100,
    val answers: List<AnswerOptionRequest>,
)

data class AnswerOptionRequest(
    val text: String,
    val isCorrect: Boolean,
)
