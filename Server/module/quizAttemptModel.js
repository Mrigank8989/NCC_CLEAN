const sql = require('mssql');
const dbConfig = require('../config/db');

const insertQuizAttempt = async (attemptData) => {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('user_id', sql.Int, attemptData.user_id)
    .input('quiz_id', sql.Int, attemptData.quiz_id)
    .input('score', sql.Int, attemptData.score)
    .input('total_questions', sql.Int, attemptData.total_questions)
    .input('percentage', sql.Decimal(5, 2), attemptData.percentage)
    .input('time_taken', sql.VarChar(50), attemptData.time_taken)
    .input('attempt_date', sql.DateTime, attemptData.attempt_date || new Date())
    .input('is_completed', sql.Bit, attemptData.is_completed)
    .query(`
      INSERT INTO quiz_attempts (
        user_id, quiz_id, score, total_questions, percentage, time_taken, attempt_date, is_completed
      )
      VALUES (
        @user_id, @quiz_id, @score, @total_questions, @percentage, @time_taken, @attempt_date, @is_completed
      )
    `);

  return result;
};

module.exports = {
  insertQuizAttempt
};
