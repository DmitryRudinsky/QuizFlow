package com.quizflow.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "participant_answers")
class ParticipantAnswer(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    val participant: SessionParticipant,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    val question: Question,

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "answer_ids", nullable = false, columnDefinition = "uuid[]")
    val answerIds: Array<UUID>,

    @Column(name = "is_correct", nullable = false)
    val isCorrect: Boolean,

    @Column(name = "points_earned", nullable = false)
    val pointsEarned: Int = 0,

    @Column(name = "submitted_at", nullable = false, updatable = false)
    val submittedAt: Instant = Instant.now(),
)
