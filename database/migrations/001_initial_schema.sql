-- ============================================
-- USUARIOS
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'OPERADOR', 'CONSULTA')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
        CHECK (status IN ('ACTIVO', 'INACTIVO')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- IMPORTACIONES
-- ============================================

CREATE TABLE imports (
    id SERIAL PRIMARY KEY,
    original_filename VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    total_records INTEGER NOT NULL DEFAULT 0,
    valid_records INTEGER NOT NULL DEFAULT 0,
    invalid_records INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL
        CHECK (status IN ('PROCESANDO', 'COMPLETADO', 'ERROR'))
);


-- ============================================
-- REGISTROS PROCESADOS
-- ============================================

CREATE TABLE records (
    id SERIAL PRIMARY KEY,
    document_type VARCHAR(2) NOT NULL
        CHECK (document_type IN ('CC', 'CE', 'TI')),
    document VARCHAR(30) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    city VARCHAR(100),
    birth_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL
        CHECK (status IN ('ACTIVO', 'INACTIVO')),
    import_id INTEGER NOT NULL REFERENCES imports(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- ERRORES DE ETL
-- ============================================

CREATE TABLE import_errors (
    id SERIAL PRIMARY KEY,
    import_id INTEGER NOT NULL REFERENCES imports(id),
    row_number INTEGER NOT NULL,
    field VARCHAR(100) NOT NULL,
    received_value TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_records_document
    ON records(document);

CREATE INDEX idx_records_email
    ON records(email);

CREATE INDEX idx_import_errors_import_id
    ON import_errors(import_id);

CREATE INDEX idx_imports_uploaded_by
    ON imports(uploaded_by);