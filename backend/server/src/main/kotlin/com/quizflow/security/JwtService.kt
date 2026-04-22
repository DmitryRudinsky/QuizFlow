package com.quizflow.security

import com.quizflow.domain.User
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.Date
import java.util.UUID
import javax.crypto.SecretKey

@Service
class JwtService {

    @Value("\${jwt.secret}")
    private lateinit var secret: String

    @Value("\${jwt.expiration}")
    private var expiration: Long = 0

    fun generateToken(user: User): String = Jwts.builder()
        .subject(user.id!!.toString())
        .issuedAt(Date())
        .expiration(Date(System.currentTimeMillis() + expiration))
        .signWith(signingKey())
        .compact()

    fun extractUserId(token: String): UUID? = try {
        UUID.fromString(claims(token).subject)
    } catch (e: Exception) {
        null
    }

    fun isValid(token: String): Boolean = try {
        claims(token).expiration.after(Date())
    } catch (e: Exception) {
        false
    }

    private fun claims(token: String) = Jwts.parser()
        .verifyWith(signingKey())
        .build()
        .parseSignedClaims(token)
        .payload

    private fun signingKey(): SecretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret))
}
