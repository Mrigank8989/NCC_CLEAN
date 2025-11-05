const express = require('express');
const router = express.Router();

const { fetchAllUsers, createUserController, SignIn } = require("../controller/authController");
const { addQuestion } = require('../controller/questionController');
const { addQuiz, fetchQuizById } = require('../controller/quizController');
const { addQuizAttempt } = require('../controller/quizAttemptController');
const pool = require('../config/db'); // ✅ Add this to run custom DB queries

// ─── Authentication Routes ──────────────────────────────────────────────
router.get('/getAllUsers', fetchAllUsers);                  
router.post('/SignUp', createUserController);               
router.post('/SignIn', SignIn);                             

// ─── Quiz Routes ──────────────────────────────────────────────
router.post('/addQuiz', addQuiz);
router.get('/:quiz_id', fetchQuizById);
router.post('/add-question', addQuestion);

// ─── Quiz Attempt Routes ───────────────────────────────────────

// ✅ 1. Check if user already attempted this quiz
router.get('/check-attempt', async (req, res) => {
  const { user_id, quiz_id } = req.query;

  try {
    const result = await pool.query(
      'SELECT * FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2',
      [user_id, quiz_id]
    );

    if (result.rows.length > 0) {
      return res.json({ attempted: true });
    } else {
      return res.json({ attempted: false });
    }
  } catch (error) {
    console.error('Error checking quiz attempt:', error);
    res.status(500).json({ message: 'Error checking quiz attempt' });
  }
});

// ✅ 2. Add new attempt (only if first)
router.post('/attempts', addQuizAttempt);

module.exports = router;
