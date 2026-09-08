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

const getImports = async () => {
  const result = await pool.query(
    `SELECT
      i.id,
      i.original_filename,
      i.uploaded_at,
      i.uploaded_by,
      u.name AS uploaded_by_name,
      i.total_records,
      i.valid_records,
      i.invalid_records,
      i.status
     FROM imports i
     INNER JOIN users u ON u.id = i.uploaded_by
     ORDER BY i.id DESC`
  );

  return result.rows;
};

const getImportErrors = async (importId) => {
  const result = await pool.query(
    `SELECT
      id,
      row_number,
      field,
      received_value,
      description,
      created_at
     FROM import_errors
     WHERE import_id = $1
     ORDER BY row_number, id`,
    [importId]
  );

  return result.rows;
};

module.exports = {
  processImport,
  getImports,
  getImportErrors
};