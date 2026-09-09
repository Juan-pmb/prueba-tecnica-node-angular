const pool = require('../../config/database');

const getErrors = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const [errorsResult, countResult] = await Promise.all([
    pool.query(
      `SELECT
        e.id,
        e.import_id,
        i.original_filename,
        e.row_number,
        e.field,
        e.received_value,
        e.description
       FROM import_errors e
       INNER JOIN imports i ON i.id = e.import_id
       ORDER BY e.id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),

    pool.query(
      `SELECT COUNT(*)::int AS total
       FROM import_errors`
    )
  ]);

  const total = countResult.rows[0].total;

  return {
    data: errorsResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  getErrors
};