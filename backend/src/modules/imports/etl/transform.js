const VALID_DOCUMENT_TYPES = ['CC', 'CE', 'TI'];
const VALID_STATUS = ['ACTIVO', 'INACTIVO'];

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

const normalizeCity = (city) => {
  return city
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const transformRows = (rows) => {
  const validRows = [];
  const errors = [];
  const documentsInFile = new Set();

  for (const row of rows) {
    const data = row.data;

    const documentType = (data.tipo_documento || '').trim().toUpperCase();
    const document = (data.documento || '').trim();
    const firstName = (data.nombres || '').trim();
    const lastName = (data.apellidos || '').trim();
    const birthDate = (data.fecha_nacimiento || '').trim();
    const email = (data.email || '').trim().toLowerCase();
    const city = normalizeCity(data.ciudad || '');
    const status = (data.estado || '').trim().toUpperCase();

    const rowErrors = [];

    if (!VALID_DOCUMENT_TYPES.includes(documentType)) {
      rowErrors.push({
        rowNumber: row.rowNumber,
        field: 'tipo_documento',
        receivedValue: documentType,
        description: 'Tipo de documento inválido'
      });
    }

    if (!document) {
      rowErrors.push({
        rowNumber: row.rowNumber,
        field: 'documento',
        receivedValue: document,
        description: 'El documento es obligatorio'
      });
    } else if (!/^\d+$/.test(document)) {
      rowErrors.push({
        rowNumber: row.rowNumber,
        field: 'documento',
        receivedValue: document,
        description: 'El documento debe contener únicamente números'
      });
    }

    if (!firstName) {
      rowErrors.push({
        rowNumber: row.rowNumber,
        field: 'nombres',
        receivedValue: firstName,
        description: 'El nombre es obligatorio'
      });
    }

    if (!lastName) {
      rowErrors.push({
        rowNumber: row.rowNumber,
        field: 'apellidos',
        receivedValue: lastName,
        description: 'El apellido es obligatorio'
      });
    }

    if (!email) {
      rowErrors.push({
        rowNumber: row.rowNumber,
        field: 'email',
        receivedValue: email,
        description: 'El email es obligatorio'
      });
    } else if (!isValidEmail(email)) {
      rowErrors.push({
        rowNumber: row.rowNumber,
        field: 'email',
        receivedValue: email,
        description: 'El email no tiene un formato válido'
      });
    }

    if (!birthDate) {
      rowErrors.push({
        rowNumber: row.rowNumber,
        field: 'fecha_nacimiento',
        receivedValue: birthDate,
        description: 'La fecha de nacimiento es obligatoria'
      });
    } else if (!isValidDate(birthDate)) {
      rowErrors.push({
        rowNumber: row.rowNumber,
        field: 'fecha_nacimiento',
        receivedValue: birthDate,
        description: 'La fecha de nacimiento no es válida'
      });
    }

    if (!VALID_STATUS.includes(status)) {
      rowErrors.push({
        rowNumber: row.rowNumber,
        field: 'estado',
        receivedValue: status,
        description: 'El estado debe ser ACTIVO o INACTIVO'
      });
    }

    if (document && documentsInFile.has(document)) {
      rowErrors.push({
        rowNumber: row.rowNumber,
        field: 'documento',
        receivedValue: document,
        description: 'El documento está repetido dentro del archivo'
      });
    }

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      continue;
    }

    documentsInFile.add(document);

    validRows.push({
      rowNumber: row.rowNumber,
      data: {
        documentType,
        document,
        firstName,
        lastName,
        email,
        city,
        birthDate,
        status
      }
    });
  }

  return {
    validRows,
    errors
  };
};

module.exports = {
  transformRows
};