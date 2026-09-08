const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = require('../../config/database');

const login = async (email, password) => {
  const result = await pool.query(
    `SELECT id, name, email, password, role, status
     FROM users
     WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Credenciales inválidas');
  }

  const user = result.rows[0];

  if (user.status !== 'ACTIVO') {
    throw new Error('Usuario inactivo');
  }

  const passwordValid = await bcrypt.compare(password, user.password);

  if (!passwordValid) {
    throw new Error('Credenciales inválidas');
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '2h'
    }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

module.exports = {
  login
};