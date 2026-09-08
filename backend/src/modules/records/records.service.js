const pool = require('../../config/database');

const getRecords = async ({
  search,
  status,
  documentType,
  page = 1,
  limit = 10
}) => {
  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);

    conditions.push(`
      (
        document ILIKE $${values.length}
        OR first_name ILIKE $${values.length}
        OR last_name ILIKE $${values.length}
        OR email ILIKE $${values.length}
      )
    `);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (documentType) {
    values.push(documentType);
    conditions.push(`document_type = $${values.length}`);
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total
     FROM records
     ${whereClause}`,
    values
  );

  const total = Number(countResult.rows[0].total);

  const offset = (page - 1) * limit;

  values.push(limit);
  values.push(offset);

  const result = await pool.query(
    `SELECT
      id,
      document_type,
      document,
      first_name,
      last_name,
      email,
      city,
      birth_date,
      status,
      import_id,
      created_at
     FROM records
     ${whereClause}
     ORDER BY id ASC
     LIMIT $${values.length - 1}
     OFFSET $${values.length}`,
    values
  );

  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  getRecords
};