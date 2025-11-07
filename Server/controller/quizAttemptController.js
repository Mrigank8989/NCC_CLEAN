const { insertQuizAttempt } = require('../module/quizAttemptModel');
const pool = require('../config/db'); // ensure PostgreSQL pool is imported

const addQuizAttempt = async (req, res) => {
  try {
    const {
      user_id,
      quiz_id,
      score,
      total_questions,
      percentage,
      time_taken,
      attempt_date = new Date(),
      is_completed
    } = req.body;

    // ✅ Check if user already attempted this quiz
    const existingAttempt = await pool.query(
      "SELECT * FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2",
      [user_id, quiz_id]
    );

    if (existingAttempt.rows.length > 0) {
      return res.status(400).json({ message: "User has already attempted this quiz." });
    }

    // ✅ Insert new attempt
    await insertQuizAttempt({
      user_id,
      quiz_id,
      score,
      total_questions,
      percentage,
      time_taken,
      attempt_date,
      is_completed
    });

    res.status(201).json({ message: 'Quiz attempt recorded successfully' });
  } catch (error) {
    console.error('Error adding quiz attempt:', error);
    res.status(500).json({ message: 'Failed to add quiz attempt' });
  }
};

module.exports = { addQuizAttempt };
