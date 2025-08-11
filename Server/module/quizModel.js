const sql = require('mssql');
const dbConfig = require('../config/db'); // adjust path if needed

async function insertQuiz(quiz) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('difficulty', sql.VarChar(20), quiz.difficulty)
      .input('set_number', sql.Int, quiz.set_number)
      .input('title', sql.VarChar(100), quiz.title)
      .query(`
        INSERT INTO quizzes (difficulty, set_number, title)
        VALUES (@difficulty, @set_number, @title);
      `);
    return result;
  } catch (error) {
    throw error;
  }
}

async function getQuizById(quiz_id) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('quiz_id', sql.Int, quiz_id)
      .query('SELECT * FROM quizzes WHERE quiz_id = @quiz_id');
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
}

module.exports = {
  insertQuiz,
  getQuizById
};
