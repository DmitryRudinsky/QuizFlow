CREATE TYPE user_role AS ENUM ('organizer', 'participant');
CREATE TYPE question_type AS ENUM ('text', 'image');
CREATE TYPE answer_type AS ENUM ('single', 'multiple');
CREATE TYPE scoring_mode AS ENUM ('standard', 'streak', 'time_bonus');
CREATE TYPE show_answers AS ENUM ('after_each', 'end_only');
CREATE TYPE session_status AS ENUM ('waiting', 'active', 'paused', 'ended');
