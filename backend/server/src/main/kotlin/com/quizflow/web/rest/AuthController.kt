package com.quizflow.web.rest

import com.quizflow.api.request.LoginRequest
import com.quizflow.api.request.RegisterRequest
import com.quizflow.api.response.UserResponse
import com.quizflow.domain.UserRole
import com.quizflow.security.JwtService
import com.quizflow.service.AuthService
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseCookie
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.time.Duration

private const val JWT_COOKIE = "jwt"

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
    private val jwtService: JwtService,
) {
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    fun register(
        @RequestBody request: RegisterRequest,
        response: HttpServletResponse,
    ): UserResponse {
        val user = authService.register(
            name = request.name,
            email = request.email,
            password = request.password,
            role = UserRole.valueOf(request.role.name),
        )
        response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie(jwtService.generateToken(user)).toString())
        return user.toResponse()
    }

    @PostMapping("/login")
    fun login(
        @RequestBody request: LoginRequest,
        response: HttpServletResponse,
    ): UserResponse {
        val user = authService.login(request.email, request.password)
        response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie(jwtService.generateToken(user)).toString())
        return user.toResponse()
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun logout(response: HttpServletResponse) {
        response.addHeader(
            HttpHeaders.SET_COOKIE,
            ResponseCookie.from(JWT_COOKIE, "").httpOnly(true).path("/").maxAge(Duration.ZERO).sameSite("Lax").build().toString(),
        )
    }

    private fun jwtCookie(value: String): ResponseCookie =
        ResponseCookie.from(JWT_COOKIE, value)
            .httpOnly(true)
            .path("/")
            .maxAge(Duration.ofDays(7))
            .sameSite("Lax")
            .build()
}
