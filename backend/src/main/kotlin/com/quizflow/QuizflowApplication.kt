package com.quizflow

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class QuizflowApplication

fun main(args: Array<String>) {
    runApplication<QuizflowApplication>(*args)
}
