const errorsService = require('./errors.service');

const getErrors = async (req, res) => {
  try {
    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit, 10) || 10,
        1
      ),
      50
    );

    const errors = await errorsService.getErrors(
      page,
      limit
    );

    return res.status(200).json(errors);
  } catch (error) {
    console.error('Error obteniendo errores:', error);

    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getErrors
};