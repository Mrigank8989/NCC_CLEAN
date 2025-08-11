const { insertQuestion } = require('../module/questionModel');
const sql = require('mssql');
const dbConfig = require('../config/db');

const addQuestion = async (req, res) => {
  try {
    const {
      quiz_id,
      question_text,
      option_1,
      option_2,
      option_3,
      option_4,
      correct_option
    } = req.body;

    await insertQuestion({
      quiz_id,
      question_text,
      option_1,
      option_2,
      option_3,
      option_4,
      correct_option
    });

    // Update the total_questions in the quizzes table
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('quiz_id', sql.Int, quiz_id)
      .query(`
        UPDATE quizzes
        SET total_questions = total_questions + 1
        WHERE quiz_id = @quiz_id
      `);

    res.status(201).json({ message: 'Question added and quiz updated successfully' });

  } catch (error) {
    console.error('Error inserting question:', error);
    res.status(500).json({ message: 'Failed to insert question' });
  }
};

module.exports = {
  addQuestion
};
