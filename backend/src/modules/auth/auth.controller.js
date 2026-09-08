const authService = require('./auth.service');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email y contraseña son obligatorios'
      });
    }

    const result = await authService.login(email, password);

    return res.status(200).json(result);
  } catch (error) {
    if (
      error.message === 'Credenciales inválidas' ||
      error.message === 'Usuario inactivo'
    ) {
      return res.status(401).json({
        message: error.message
      });
    }

    console.error('Error en login:', error);

    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  login
};