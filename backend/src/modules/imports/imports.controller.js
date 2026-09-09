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

const getImports = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 6, 1),
      50
    );

    const imports = await importsService.getImports(page, limit);

    return res.status(200).json(imports);
  } catch (error) {
    console.error('Error obteniendo importaciones:', error);

    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

const getImportById = async (req, res) => {
  try {
    const { id } = req.params;

    const importData = await importsService.getImportById(id);

    if (!importData) {
      return res.status(404).json({
        message: 'Importación no encontrada'
      });
    }

    return res.status(200).json(importData);
  } catch (error) {
    console.error('Error obteniendo importación:', error);

    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

const getImportErrors = async (req, res) => {
  try {
    const { id } = req.params;

    const errors = await importsService.getImportErrors(id);

    return res.status(200).json(errors);
  } catch (error) {
    console.error('Error obteniendo errores de importación:', error);

    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};



module.exports = {
  createImport,
  getImports,
  getImportById,
  getImportErrors
};
