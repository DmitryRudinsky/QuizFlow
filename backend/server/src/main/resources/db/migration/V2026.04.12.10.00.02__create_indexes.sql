CREATE INDEX idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_questions_position ON questions(quiz_id, position);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_sessions_room_code ON sessions(room_code);
CREATE INDEX idx_sessions_host ON sessions(host_id);
CREATE INDEX idx_participants_session ON session_participants(session_id);
CREATE INDEX idx_participant_answers_participant ON participant_answers(participant_id);
