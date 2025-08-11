const config = require('../../config/db');
const sql = require("mssql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require('dotenv').config();

const loginUser = async (username, password) => {
  try {
    const pool = await sql.connect(config);

    const userQuery = await pool.request()
      .input("username", sql.VarChar, username)
      .query(`
        SELECT 
          user_id,
          username,
          full_name,
          password_hash,
          is_admin
        FROM users
        WHERE username = @username
      `);

    if (userQuery.recordset.length === 0) {
      return { success: false, message: "User not found." };
    }

    const user = userQuery.recordset[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return { success: false, message: "Invalid credentials." };
    }

    // Generate JWT token (optional)
    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        is_admin: user.is_admin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return {
      success: true,
      message: "Login successful!",
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        is_admin: user.is_admin,
        accessToken:token
      },
    };
  } catch (error) {
    console.error("Error logging in user:", error);
    return { success: false, message: "Login failed.", error: error.message };
  }
};

module.exports = {
  loginUser,
};
