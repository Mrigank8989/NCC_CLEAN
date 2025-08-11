use ncc_quiz_portal

CREATE TABLE quizzes (
    quiz_id INT IDENTITY(1,1) PRIMARY KEY,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'intermediate', 'hard')) NOT NULL,
    set_number INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    total_questions INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE questions (
    question_id INT IDENTITY(1,1) PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    option_1 TEXT NOT NULL,
    option_2 TEXT NOT NULL,
    option_3 TEXT NOT NULL,
    option_4 TEXT NOT NULL,
    correct_option INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id)
);

CREATE TABLE quiz_attempts (
    attempt_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    time_taken INT NOT NULL, -- time in seconds or minutes
    attempt_date DATETIME DEFAULT GETDATE(),
    is_completed BIT DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id)
);

CREATE TABLE user_answers (
    answer_id INT IDENTITY(1,1) PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_option INT NULL,
    is_correct BIT NULL,
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(attempt_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id)
);
