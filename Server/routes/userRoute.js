const express = require('express');
const router = express.Router();

const { fetchAllUsers, createUserController, SignIn } = require("../controller/authController");
const { addQuestion } = require('../controller/questionController');
const { addQuiz, fetchQuizById } = require('../controller/quizController');
const { addQuizAttempt, checkQuizAttempt } = require('../controller/quizAttemptController'); // ✅ imported new controller

// ─── Authentication Routes ──────────────────────────────────────────────
router.get('/getAllUsers', fetchAllUsers);                  
router.post('/SignUp', createUserController);               
router.post('/SignIn', SignIn);                             

// ─── Quiz Routes ──────────────────────────────────────────────
router.post('/addQuiz', addQuiz);
router.get('/:quiz_id', fetchQuizById);
router.post('/add-question', addQuestion);

// ─── Quiz Attempt Routes ───────────────────────────────────────
router.post('/attempts', addQuizAttempt);

// ✅ new endpoint to check whether a user already attempted the quiz
router.get('/attempts/check', checkQuizAttempt);

module.exports = router;
