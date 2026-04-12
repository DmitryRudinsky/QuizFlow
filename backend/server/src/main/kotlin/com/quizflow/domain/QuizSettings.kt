package com.quizflow.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.MapsId
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "quiz_settings")
class QuizSettings(
    @Id
    var id: UUID? = null,

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "quiz_id")
    var quiz: Quiz,

    @Column(name = "time_per_question", nullable = false)
    var timePerQuestion: Int = 30,

    @Enumerated(EnumType.STRING)
    @Column(name = "scoring_mode", nullable = false, columnDefinition = "scoring_mode")
    var scoringMode: ScoringMode = ScoringMode.standard,

    @Column(name = "allow_answer_changes", nullable = false)
    var allowAnswerChanges: Boolean = false,

    @Column(name = "randomize_questions", nullable = false)
    var randomizeQuestions: Boolean = false,

    @Enumerated(EnumType.STRING)
    @Column(name = "show_correct_answers", nullable = false, columnDefinition = "show_answers")
    var showCorrectAnswers: ShowAnswers = ShowAnswers.after_each,
)
