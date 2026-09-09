const { transformRows } = require('../src/modules/imports/etl/transform');

describe('ETL transform', () => {

    //detectar un registro inválido
  test('should detect invalid document number', () => {
    const rows = [
      {
        rowNumber: 2,
        data: {
          tipo_documento: 'CC',
          documento: 'ABC123',
          nombres: 'Juan',
          apellidos: 'Perez',
          fecha_nacimiento: '1990-01-01',
          email: 'juan@test.com',
          ciudad: 'Bogota',
          estado: 'ACTIVO'
        }
      }
    ];

    const result = transformRows(rows);

    expect(result.validRows).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('documento');
  });

  //detectar documentos duplicados dentro del mismo CSV
  test('should detect duplicate documents within the same file', () => {
  const rows = [
    {
      rowNumber: 2,
      data: {
        tipo_documento: 'CC',
        documento: '123456',
        nombres: 'Juan',
        apellidos: 'Perez',
        fecha_nacimiento: '1990-01-01',
        email: 'juan@test.com',
        ciudad: 'Bogota',
        estado: 'ACTIVO'
      }
    },
    {
      rowNumber: 3,
      data: {
        tipo_documento: 'CC',
        documento: '123456',
        nombres: 'Pedro',
        apellidos: 'Gomez',
        fecha_nacimiento: '1991-01-01',
        email: 'pedro@test.com',
        ciudad: 'Medellin',
        estado: 'ACTIVO'
      }
    }
  ];

  const result = transformRows(rows);

  expect(result.validRows).toHaveLength(1);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].field).toBe('documento');
  expect(result.errors[0].rowNumber).toBe(3);
});

//validar email incorrecto
test('should detect invalid email', () => {
  const rows = [
    {
      rowNumber: 2,
      data: {
        tipo_documento: 'CC',
        documento: '123456',
        nombres: 'Juan',
        apellidos: 'Perez',
        fecha_nacimiento: '1990-01-01',
        email: 'correo-invalido',
        ciudad: 'Bogota',
        estado: 'ACTIVO'
      }
    }
  ];

  const result = transformRows(rows);

  expect(result.validRows).toHaveLength(0);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].field).toBe('email');
});


//fecha inválida
test('should detect invalid birth date', () => {
  const rows = [
    {
      rowNumber: 2,
      data: {
        tipo_documento: 'CC',
        documento: '123456',
        nombres: 'Juan',
        apellidos: 'Perez',
        fecha_nacimiento: '2025-02-30',
        email: 'juan@test.com',
        ciudad: 'Bogota',
        estado: 'ACTIVO'
      }
    }
  ];

  const result = transformRows(rows);

  expect(result.validRows).toHaveLength(0);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].field).toBe('fecha_nacimiento');
});


//una fila puede tener varios errores
test('should detect multiple errors in the same row', () => {
  const rows = [
    {
      rowNumber: 2,
      data: {
        tipo_documento: 'XX',
        documento: 'ABC',
        nombres: '',
        apellidos: '',
        fecha_nacimiento: '2025-02-30',
        email: 'correo-invalido',
        ciudad: 'Bogota',
        estado: 'OTRO'
      }
    }
  ];

  const result = transformRows(rows);

  expect(result.validRows).toHaveLength(0);
  expect(result.errors.length).toBeGreaterThan(1);

  const errorRows = new Set(
    result.errors.map((error) => error.rowNumber)
  );

  expect(errorRows.size).toBe(1);
});

//registro completamente válido
test('should transform a valid record correctly', () => {
  const rows = [
    {
      rowNumber: 2,
      data: {
        tipo_documento: 'cc',
        documento: '123456',
        nombres: ' Juan ',
        apellidos: ' Perez ',
        fecha_nacimiento: '1990-01-01',
        email: 'JUAN@TEST.COM',
        ciudad: 'bogota',
        estado: 'activo'
      }
    }
  ];

  const result = transformRows(rows);

  expect(result.errors).toHaveLength(0);
  expect(result.validRows).toHaveLength(1);

  expect(result.validRows[0].data).toEqual({
    documentType: 'CC',
    document: '123456',
    firstName: 'Juan',
    lastName: 'Perez',
    birthDate: '1990-01-01',
    email: 'juan@test.com',
    city: 'Bogota',
    status: 'ACTIVO'
  });
});
});