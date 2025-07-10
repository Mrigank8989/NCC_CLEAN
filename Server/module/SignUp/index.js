const config = require('../../config/db');
const sql = require('mssql');
const bcrypt = require('bcrypt');

// Get all users
const getAllUsers = async () => {
  try {
    let pool = await sql.connect(config);
    let Users = await pool.request().query("SELECT * FROM users"); // table name lowercase
    return Users.recordset;
  } catch (error) {
    console.error('Error fetching all users:', error);
    return { success: false, message: "Failed to fetch users." };
  }
};

// Create a new user
const createUser = async (username, fullName, password, isAdmin = false) => {
  try {
    console.log("User Data Received:", username, fullName, password);

    let pool = await sql.connect(config);

    // Check if username already exists
    const usernameCheck = await pool.request()
      .input('Username', sql.VarChar(50), username)
      .query('SELECT * FROM users WHERE username = @Username');

    if (usernameCheck.recordset.length > 0) {
      console.log("Username already exists");
      return { success: false, message: "Username already exists. Please choose another." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await pool.request()
      .input('Username', sql.VarChar(50), username)
      .input('PasswordHash', sql.VarChar(255), hashedPassword)
      .input('FullName', sql.VarChar(100), fullName)
      .input('IsAdmin', sql.Bit, isAdmin ? 1 : 0)
      .query(`
        INSERT INTO users (username, password_hash, full_name, is_admin)
        VALUES (@Username, @PasswordHash, @FullName, @IsAdmin)
      `);

    console.log("User successfully registered.");
    return { success: true, message: "User registered successfully." };
  } catch (error) {
    console.error("Error inserting user:", error);
    return { success: false, message: "Failed to register user." };
  }
};

module.exports = {
  getAllUsers,
  createUser
};
