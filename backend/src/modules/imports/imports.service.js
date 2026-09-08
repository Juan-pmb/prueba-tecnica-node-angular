const pool = require('../../config/database');

const { extractCsv } = require('./etl/extract');
const { transformRows } = require('./etl/transform');
const { loadValidRows, loadErrors } = require('./etl/load');

const processImport = async (filePath, originalFilename, userId) => {
  const importResult = await pool.query(
    `INSERT INTO imports (
      original_filename,
      uploaded_by,
      status
    )
    VALUES ($1, $2, $3)
    RETURNING id`,
    [originalFilename, userId, 'PROCESANDO']
  );

  const importId = importResult.rows[0].id;

  try {
    // EXTRACT
    const rows = await extractCsv(filePath);

    // TRANSFORM
    const { validRows, errors } = transformRows(rows);

    // LOAD
    const loadedRecords = await loadValidRows(validRows, importId);

    await loadErrors(errors, importId);

    const totalRecords = rows.length;
    const invalidRecords = errors.length;

    await pool.query(
      `UPDATE imports
       SET total_records = $1,
           valid_records = $2,
           invalid_records = $3,
           status = $4
       WHERE id = $5`,
      [
        totalRecords,
        loadedRecords,
        invalidRecords,
        'COMPLETADO',
        importId
      ]
    );

    return {
      importId,
      totalRecords,
      validRecords: loadedRecords,
      invalidRecords,
      status: 'COMPLETADO'
    };
  } catch (error) {
    await pool.query(
      `UPDATE imports
       SET status = $1
       WHERE id = $2`,
      ['ERROR', importId]
    );

    throw error;
  }
};

module.exports = {
  processImport
};