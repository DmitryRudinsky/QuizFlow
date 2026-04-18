package com.quizflow.web.ws.messages

import java.util.UUID

enum class SessionCommandType {
    NEXT,
    END,
}

data class SessionCommand(
    val hostId: UUID,
    val type: SessionCommandType,
)
