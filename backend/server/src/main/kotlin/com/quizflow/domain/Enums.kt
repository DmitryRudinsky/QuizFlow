package com.quizflow.domain

enum class UserRole {
    organizer, participant
}

enum class QuestionType {
    text, image
}

enum class AnswerType {
    single, multiple
}

enum class ScoringMode {
    standard, streak, time_bonus
}

enum class ShowAnswers {
    after_each, end_only
}

enum class SessionStatus {
    waiting, active, paused, ended
}
