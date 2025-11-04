require('dotenv').config();
const { Pool } = require('pg');

// PostgreSQL connection pool (for Neon + Render)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,              // important for Neon
    rejectUnauthorized: false   // allows Render to connect without CA cert
  },
  connectionTimeoutMillis: 10000, // 10 seconds
  idleTimeoutMillis: 30000        // prevent idle disconnects
});

// Connection events (for debugging)
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL (Neon)');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err);
  process.exit(-1);
});

module.exports = pool;
