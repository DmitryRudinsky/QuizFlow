package com.quizflow.domain

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "questions")
class Question(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    val quiz: Quiz,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "question_type")
    var type: QuestionType = QuestionType.text,

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    var questionText: String,

    @Column(name = "image_url")
    var imageUrl: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "answer_type", nullable = false, columnDefinition = "answer_type")
    var answerType: AnswerType = AnswerType.single,

    @Column(name = "time_limit", nullable = false)
    var timeLimit: Int = 30,

    @Column(nullable = false)
    var points: Int = 100,

    @Column(nullable = false)
    var position: Int,

    @OneToMany(mappedBy = "question", cascade = [CascadeType.ALL], orphanRemoval = true)
    val answers: MutableList<Answer> = mutableListOf(),
)
