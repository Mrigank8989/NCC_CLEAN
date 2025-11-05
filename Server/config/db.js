require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false
  },
  max: 5,                  // Limit pool size
  idleTimeoutMillis: 30000, // Close idle clients after 30s
  connectionTimeoutMillis: 10000 // 10s connect timeout
});

pool.on('connect', () => console.log('✅ Connected to PostgreSQL (Neon)'));
pool.on('error', (err) => console.error('❌ Unexpected PG Pool Error:', err));

module.exports = pool;
