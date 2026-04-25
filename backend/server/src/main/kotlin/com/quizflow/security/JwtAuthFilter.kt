package com.quizflow.security

import com.quizflow.repository.UserRepository
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthFilter(
    private val jwtService: JwtService,
    private val userRepository: UserRepository,
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val token = request.cookies?.find { it.name == "jwt" }?.value

        if (token != null) {
            try {
                if (jwtService.isValid(token)) {
                    val userId = jwtService.extractUserId(token)
                    if (userId != null) {
                        userRepository.findById(userId).ifPresent { user ->
                            val auth = UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                listOf(SimpleGrantedAuthority("ROLE_${user.role.name}")),
                            )
                            SecurityContextHolder.getContext().authentication = auth
                        }
                    }
                }
            } catch (_: Exception) {
                // expired or malformed token — just skip, security rules decide access
            }
        }

        filterChain.doFilter(request, response)
    }
}
