const importsService = require('./imports.service');

const createImport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Debes seleccionar un archivo CSV'
      });
    }

    if (req.file.size === 0) {
      return res.status(400).json({
        message: 'El archivo CSV está vacío'
      });
    }

    const result = await importsService.processImport(
      req.file.path,
      req.file.originalname,
      req.user.id
    );

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error procesando importación:', error);

    return res.status(500).json({
      message: 'Error procesando el archivo CSV'
    });
  }
};

module.exports = {
  createImport
};