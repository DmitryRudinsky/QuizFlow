package com.quizflow.service

import com.quizflow.domain.Answer
import com.quizflow.domain.AnswerType
import com.quizflow.domain.Question
import com.quizflow.domain.QuestionType
import com.quizflow.domain.Quiz
import com.quizflow.domain.QuizSettings
import com.quizflow.exception.AccessDeniedException
import com.quizflow.exception.NotFoundException
import com.quizflow.repository.QuizRepository
import com.quizflow.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class QuizService(
    private val quizRepository: QuizRepository,
    private val userRepository: UserRepository,
) {
    fun getQuiz(quizId: UUID): Quiz {
        return quizRepository.findById(quizId)
            .orElseThrow { NotFoundException("Quiz", quizId) }
    }

    fun getQuizzesByUser(userId: UUID): List<Quiz> {
        return quizRepository.findByCreatedById(userId)
    }

    fun createQuiz(userId: UUID, title: String, description: String?, category: String?): Quiz {
        val user = userRepository.findById(userId)
            .orElseThrow { NotFoundException("User", userId) }

        val quiz = Quiz(
            title = title,
            description = description,
            category = category,
            createdBy = user,
        )

        quiz.settings = QuizSettings(quiz = quiz)

        return quizRepository.save(quiz)
    }

    fun updateQuiz(
        userId: UUID,
        quizId: UUID,
        title: String?,
        description: String?,
        category: String?,
    ): Quiz {
        val quiz = getQuizAndCheckOwner(quizId, userId)

        title?.let { quiz.title = it }
        description?.let { quiz.description = it }
        category?.let { quiz.category = it }
        quiz.updatedAt = Instant.now()

        return quizRepository.save(quiz)
    }

    fun deleteQuiz(userId: UUID, quizId: UUID) {
        val quiz = getQuizAndCheckOwner(quizId, userId)
        quizRepository.delete(quiz)
    }

    fun addQuestion(
        userId: UUID,
        quizId: UUID,
        questionText: String,
        type: QuestionType = QuestionType.text,
        answerType: AnswerType = AnswerType.single,
        timeLimit: Int = 30,
        points: Int = 100,
        answers: List<Pair<String, Boolean>>,
    ): Quiz {
        val quiz = getQuizAndCheckOwner(quizId, userId)

        val position = quiz.questions.size

        val question = Question(
            quiz = quiz,
            questionText = questionText,
            type = type,
            answerType = answerType,
            timeLimit = timeLimit,
            points = points,
            position = position,
        )

        answers.forEach { (text, isCorrect) ->
            question.answers.add(Answer(question = question, text = text, isCorrect = isCorrect))
        }

        quiz.questions.add(question)
        quiz.updatedAt = Instant.now()

        return quizRepository.save(quiz)
    }

    private fun getQuizAndCheckOwner(quizId: UUID, userId: UUID): Quiz {
        val quiz = quizRepository.findById(quizId)
            .orElseThrow { NotFoundException("Quiz", quizId) }

        if (quiz.createdBy.id != userId) {
            throw AccessDeniedException("You don't have permission to modify this quiz")
        }

        return quiz
    }
}
