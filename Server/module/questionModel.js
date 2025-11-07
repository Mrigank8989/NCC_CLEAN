const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ─── Controllers ──────────────────────────────────────────────
const { fetchAllUsers, createUserController, SignIn } = require("../controller/authController");
const { addQuestion } = require('../controller/questionController');
const { addQuiz, fetchQuizById } = require('../controller/quizController');
const { addQuizAttempt } = require('../controller/quizAttemptController');

// ─── Authentication Routes ────────────────────────────────────
router.get('/getAllUsers', fetchAllUsers);
router.post('/SignUp', createUserController);
router.post('/SignIn', SignIn);

// ─── Quiz Routes ──────────────────────────────────────────────
router.post('/addQuiz', addQuiz);
router.get('/quiz/:quiz_id', fetchQuizById);
router.post('/add-question', addQuestion);

// ─── Quiz Attempt Routes ──────────────────────────────────────

// ✅ Check if user already attempted the quiz
router.get('/attempts/check', async (req, res) => {
  const { user_id, quiz_id } = req.query;

  try {
    const result = await pool.query(
      'SELECT * FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2',
      [user_id, quiz_id]
    );

    res.json({ attempted: result.rows.length > 0 });
  } catch (error) {
    console.error('❌ Error checking quiz attempt:', error);
    res.status(500).json({ message: 'Error checking quiz attempt' });
  }
});

// ✅ Add new quiz attempt
router.post('/attempts', async (req, res, next) => {
  console.log('📩 Incoming quiz attempt data:', req.body);
  next(); // Pass to controller (addQuizAttempt)
}, addQuizAttempt);

module.exports = router;
