const pool = require('../../config/database');

const getReports = async () => {
  const recordsResult = await pool.query(`
    SELECT
      COUNT(*) AS total_records,
      COUNT(*) FILTER (WHERE status = 'ACTIVO') AS active_records,
      COUNT(*) FILTER (WHERE status = 'INACTIVO') AS inactive_records
    FROM records
  `);

  const importsResult = await pool.query(`
    SELECT
      COUNT(*) AS total_imports,
      COUNT(*) FILTER (WHERE status = 'COMPLETADO') AS completed_imports,
      COUNT(*) FILTER (WHERE status = 'ERROR') AS failed_imports,
      COALESCE(SUM(total_records), 0) AS imported_records,
      COALESCE(SUM(invalid_records), 0) AS invalid_records
    FROM imports
  `);

  const errorsResult = await pool.query(`
    SELECT COUNT(*) AS total_errors
    FROM import_errors
  `);

  return {
    records: {
      total: Number(recordsResult.rows[0].total_records),
      active: Number(recordsResult.rows[0].active_records),
      inactive: Number(recordsResult.rows[0].inactive_records)
    },
    imports: {
      total: Number(importsResult.rows[0].total_imports),
      completed: Number(importsResult.rows[0].completed_imports),
      failed: Number(importsResult.rows[0].failed_imports),
      importedRecords: Number(importsResult.rows[0].imported_records),
      invalidRecords: Number(importsResult.rows[0].invalid_records)
    },
    errors: {
      total: Number(errorsResult.rows[0].total_errors)
    }
  };
};

module.exports = {
  getReports
};