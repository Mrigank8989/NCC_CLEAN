// models/questionModel.js
const sql = require('mssql');
const dbConfig = require('../config/db');

const insertQuestion = async (questionData) => {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('quiz_id', sql.Int, questionData.quiz_id)
    .input('question_text', sql.Text, questionData.question_text)
    .input('option_1', sql.Text, questionData.option_1)
    .input('option_2', sql.Text, questionData.option_2)
    .input('option_3', sql.Text, questionData.option_3)
    .input('option_4', sql.Text, questionData.option_4)
    .input('correct_option', sql.Int, questionData.correct_option)
    .query(`
      INSERT INTO questions 
      (quiz_id, question_text, option_1, option_2, option_3, option_4, correct_option)
      VALUES (@quiz_id, @question_text, @option_1, @option_2, @option_3, @option_4, @correct_option)
    `);

  return result;
};

module.exports = {
  insertQuestion
};
