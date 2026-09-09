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
// LOAD
await loadValidRows(validRows, importId);

await loadErrors(errors, importId);

const totalRecords = rows.length;
const validRecords = validRows.length;

const invalidRecords = new Set(
  errors.map((error) => error.rowNumber)
).size;

await pool.query(
  `UPDATE imports
   SET total_records = $1,
       valid_records = $2,
       invalid_records = $3,
       status = $4
   WHERE id = $5`,
  [
    totalRecords,
    validRecords,
    invalidRecords,
    'COMPLETADO',
    importId
  ]
);

return {
  importId,
  totalRecords,
  validRecords,
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

const getImports = async (page = 1, limit = 6) => {
  const offset = (page - 1) * limit;

  const [importsResult, countResult] = await Promise.all([
    pool.query(
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
       ORDER BY i.id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),

    pool.query(
      `SELECT COUNT(*)::int AS total
       FROM imports`
    )
  ]);

  const total = countResult.rows[0].total;
  const totalPages = Math.ceil(total / limit);

  return {
    data: importsResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
};

const getImportById = async (importId) => {
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
     WHERE i.id = $1`,
    [importId]
  );

  return result.rows[0] || null;
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
  getImportById,
  getImportErrors
};