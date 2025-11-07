const { insertQuizAttempt } = require('../module/quizAttemptModel');
const pool = require('../config/db');

const addQuizAttempt = async (req, res) => {
  try {
    console.log("📩 Received attempt data:", req.body); // ✅ Log incoming data

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

    const existingAttempt = await pool.query(
      "SELECT * FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2",
      [user_id, quiz_id]
    );
    console.log("🔍 Existing attempt check:", existingAttempt.rows);

    // Proceed without blocking for now (just test DB insert)
    const result = await insertQuizAttempt({
      user_id,
      quiz_id,
      score,
      total_questions,
      percentage,
      time_taken,
      attempt_date,
      is_completed
    });

    console.log("✅ DB insert result:", result);

    res.status(201).json({ message: "Quiz attempt recorded successfully", result });
  } catch (error) {
    console.error("❌ Error adding quiz attempt:", error);
    res.status(500).json({ message: "Failed to add quiz attempt", error: error.message });
  }
};

module.exports = { addQuizAttempt };
