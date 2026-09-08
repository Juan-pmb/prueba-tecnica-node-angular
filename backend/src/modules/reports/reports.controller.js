const reportsService = require('./reports.service');

const getReports = async (req, res) => {
  try {
    const reports = await reportsService.getReports();

    return res.status(200).json(reports);
  } catch (error) {
    console.error('Error obteniendo reportes:', error);

    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getReports
};