const bcrypt = require('bcrypt');
const pool = require('../../config/database');

const getUsers = async () => {
  const result = await pool.query(
    `SELECT id, name, email, role, status, created_at
     FROM users
     ORDER BY id ASC`
  );

  return result.rows;
};

const createUser = async ({ name, email, password, role, status = 'ACTIVO' }) => {
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, role, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, status, created_at`,
    [name, email, passwordHash, role, status]
  );

  return result.rows[0];
};

module.exports = {
  getUsers,
  createUser
};