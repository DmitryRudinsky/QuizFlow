package com.quizflow.exception

class EmailAlreadyExistsException(email: String) :
    RuntimeException("User with email '$email' already exists")

class InvalidCredentialsException :
    RuntimeException("Invalid email or password")

class NotFoundException(entity: String, id: Any) :
    RuntimeException("$entity with id '$id' not found")

class AccessDeniedException(message: String) :
    RuntimeException(message)

class SessionAlreadyStartedException(roomCode: String) :
    RuntimeException("Session '$roomCode' has already started")

class SessionNotActiveException(roomCode: String) :
    RuntimeException("Session '$roomCode' is not active")

class AlreadyJoinedException :
    RuntimeException("User already joined this session")

class AlreadyAnsweredException :
    RuntimeException("Participant already answered this question")
