CREATE UNIQUE INDEX idx_session_participants_unique_user
    ON session_participants (session_id, user_id)
    WHERE user_id IS NOT NULL;

ALTER TABLE answers
    ADD CONSTRAINT uq_answers_question_text UNIQUE (question_id, text);
