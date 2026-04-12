CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          user_role    NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE quizzes (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    category    VARCHAR(100),
    cover_image TEXT,
    created_by  UUID         NOT NULL REFERENCES users(id),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE quiz_settings (
    quiz_id              UUID         PRIMARY KEY REFERENCES quizzes(id) ON DELETE CASCADE,
    time_per_question    INT          NOT NULL DEFAULT 30,
    scoring_mode         scoring_mode NOT NULL DEFAULT 'standard',
    allow_answer_changes BOOLEAN      NOT NULL DEFAULT false,
    randomize_questions  BOOLEAN      NOT NULL DEFAULT false,
    show_correct_answers show_answers NOT NULL DEFAULT 'after_each'
);

CREATE TABLE questions (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id       UUID          NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    type          question_type NOT NULL DEFAULT 'text',
    question_text TEXT          NOT NULL,
    image_url     TEXT,
    answer_type   answer_type   NOT NULL DEFAULT 'single',
    time_limit    INT           NOT NULL DEFAULT 30,
    points        INT           NOT NULL DEFAULT 100,
    position      INT           NOT NULL,
    UNIQUE (quiz_id, position)
);

CREATE TABLE answers (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID         NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    text        VARCHAR(500) NOT NULL,
    is_correct  BOOLEAN      NOT NULL DEFAULT false
);

CREATE TABLE sessions (
    id                     UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code              VARCHAR(20)    NOT NULL UNIQUE,
    quiz_id                UUID           NOT NULL REFERENCES quizzes(id),
    host_id                UUID           NOT NULL REFERENCES users(id),
    status                 session_status NOT NULL DEFAULT 'waiting',
    current_question_index INT            NOT NULL DEFAULT 0,
    started_at             TIMESTAMPTZ,
    ended_at               TIMESTAMPTZ,
    created_at             TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE TABLE session_participants (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID         NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id    UUID         REFERENCES users(id),
    nickname   VARCHAR(100) NOT NULL,
    score      INT          NOT NULL DEFAULT 0,
    joined_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE participant_answers (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID        NOT NULL REFERENCES session_participants(id) ON DELETE CASCADE,
    question_id    UUID        NOT NULL REFERENCES questions(id),
    answer_ids     UUID[]      NOT NULL,
    is_correct     BOOLEAN     NOT NULL,
    points_earned  INT         NOT NULL DEFAULT 0,
    submitted_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (participant_id, question_id)
);
