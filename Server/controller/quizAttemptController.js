const { insertQuizAttempt } = require('../module/quizAttemptModel');
const pool = require('../config/db'); // ✅ Import DB connection

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

    // ✅ Check if the user already attempted this quiz
    const existingAttempt = await pool.query(
      'SELECT * FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2',
      [user_id, quiz_id]
    );

    if (existingAttempt.rows.length > 0) {
      console.log(`❌ User ${user_id} already attempted quiz ${quiz_id}`);
      return res.status(400).json({ message: 'User has already attempted this quiz.' });
    }

    // ✅ If not attempted before, insert the attempt
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

    console.log(`✅ Attempt added for user ${user_id}, quiz ${quiz_id}`);
    res.status(201).json({ message: 'Quiz attempt recorded successfully' });
  } catch (error) {
    console.error('❌ Error adding quiz attempt:', error);
    res.status(500).json({ message: 'Failed to add quiz attempt' });
  }
};

module.exports = {
  addQuizAttempt
};
