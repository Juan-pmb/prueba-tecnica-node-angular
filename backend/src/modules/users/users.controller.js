const usersService = require('./users.service');

const getUsers = async (req, res) => {
  try {
    const users = await usersService.getUsers();

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);

    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'Nombre, email, contraseña y rol son obligatorios'
      });
    }

    const validRoles = ['ADMIN', 'OPERADOR', 'CONSULTA'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: 'Rol inválido'
      });
    }

    const user = await usersService.createUser({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      status
    });

    return res.status(201).json(user);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        message: 'El email ya está registrado'
      });
    }

    console.error('Error creando usuario:', error);

    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};
module.exports = {
  getUsers,
  createUser
};