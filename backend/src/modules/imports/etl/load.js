const pool = require('../../../config/database');

const loadValidRows = async (validRows, importId) => {
  let loadedRecords = 0;

  for (const row of validRows) {
    const {
      documentType,
      document,
      firstName,
      lastName,
      email,
      city,
      birthDate,
      status
    } = row.data;

    const result = await pool.query(
      `INSERT INTO records (
        document_type,
        document,
        first_name,
        last_name,
        email,
        city,
        birth_date,
        status,
        import_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (document) DO NOTHING
      RETURNING id`,
      [
        documentType,
        document,
        firstName,
        lastName,
        email,
        city || null,
        birthDate,
        status,
        importId
      ]
    );

    if (result.rows.length > 0) {
      loadedRecords += 1;
    }
  }

  return loadedRecords;
};

const loadErrors = async (errors, importId) => {
  for (const error of errors) {
    await pool.query(
      `INSERT INTO import_errors (
        import_id,
        row_number,
        field,
        received_value,
        description
      )
      VALUES ($1, $2, $3, $4, $5)`,
      [
        importId,
        error.rowNumber,
        error.field,
        error.receivedValue || null,
        error.description
      ]
    );
  }
};

module.exports = {
  loadValidRows,
  loadErrors
};