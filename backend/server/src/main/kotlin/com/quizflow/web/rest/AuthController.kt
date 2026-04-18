package com.quizflow.web.rest

import com.quizflow.api.request.LoginRequest
import com.quizflow.api.request.RegisterRequest
import com.quizflow.api.response.UserResponse
import com.quizflow.domain.UserRole
import com.quizflow.service.AuthService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
) {
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    fun register(@RequestBody request: RegisterRequest): UserResponse {
        val user = authService.register(
            name = request.name,
            email = request.email,
            password = request.password,
            role = UserRole.valueOf(request.role.name),
        )
        return user.toResponse()
    }

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): UserResponse {
        val user = authService.login(request.email, request.password)
        return user.toResponse()
    }
}
