package com.quizflow.api.request

import com.quizflow.api.model.UserRoleDto

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val role: UserRoleDto = UserRoleDto.organizer,
)

data class LoginRequest(
    val email: String,
    val password: String,
)
