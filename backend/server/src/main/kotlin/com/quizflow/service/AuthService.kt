package com.quizflow.service

import com.quizflow.domain.User
import com.quizflow.domain.UserRole
import com.quizflow.exception.EmailAlreadyExistsException
import com.quizflow.exception.InvalidCredentialsException
import com.quizflow.repository.UserRepository
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: BCryptPasswordEncoder,
) {
    fun register(name: String, email: String, password: String, role: UserRole): User {
        if (userRepository.existsByEmail(email)) {
            throw EmailAlreadyExistsException(email)
        }

        val user = User(
            name = name,
            email = email,
            passwordHash = passwordEncoder.encode(password),
            role = role,
        )

        return userRepository.save(user)
    }

    fun login(email: String, password: String): User {
        val user = userRepository.findByEmail(email)
            ?: throw InvalidCredentialsException()

        if (!passwordEncoder.matches(password, user.passwordHash)) {
            throw InvalidCredentialsException()
        }

        return user
    }
}
