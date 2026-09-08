const recordsService = require('./records.service');

const getRecords = async (req, res) => {
  try {
    const {
  search,
  status,
  documentType,
  page = '1',
  limit = '10'
} = req.query;
    const validStatuses = ['ACTIVO', 'INACTIVO'];
const validDocumentTypes = ['CC', 'CE', 'TI'];

if (status && !validStatuses.includes(status.toUpperCase())) {
  return res.status(400).json({
    message: 'Estado inválido'
  });
}

if (
  documentType &&
  !validDocumentTypes.includes(documentType.toUpperCase())
) {
  return res.status(400).json({
    message: 'Tipo de documento inválido'
  });
}

const pageNumber = Number(page);
const limitNumber = Number(limit);

if (
  !Number.isInteger(pageNumber) ||
  pageNumber < 1 ||
  !Number.isInteger(limitNumber) ||
  limitNumber < 1 ||
  limitNumber > 100
) {
  return res.status(400).json({
    message: 'Los parámetros page y limit no son válidos'
  });
}

    const records = await recordsService.getRecords({
  search,
  status: status ? status.toUpperCase() : undefined,
  documentType: documentType ? documentType.toUpperCase() : undefined,
  page: pageNumber,
  limit: limitNumber
});

    return res.status(200).json(records);
  } catch (error) {
    console.error('Error obteniendo registros:', error);

    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getRecords
};