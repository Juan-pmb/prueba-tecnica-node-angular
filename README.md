# Prueba Técnica - Node.js + Angular

Aplicación web para la gestión y procesamiento de información de usuarios mediante archivos CSV.

El proyecto implementa autenticación, autorización basada en roles, carga y procesamiento ETL de archivos CSV, consulta de registros, consulta de errores, historial de importaciones, dashboard y reportes.

## Tecnologías

### Backend
- Node.js
- Express
- PostgreSQL
- JWT
- bcrypt
- Multer
- csv-parser
- Jest
- Supertest

### Frontend
- Angular
- TypeScript
- Angular Router
- HttpClient
- Vitest

### Base de datos
- PostgreSQL

## Estructura del proyecto

```text
prueba-tecnica/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   └── server.js
│   ├── .env.example
│   └── test/
├── frontend/
│   └── src/
├── database/
│   ├── migrations/
│   └── seeds/
├── .gitignore
└── README.md
```

## Instalación

### Requisitos

Se requiere tener instalado:

- Node.js
- npm
- PostgreSQL
- Git

Versiones utilizadas durante el desarrollo:

- Node.js 24.x
- npm 11.x
- PostgreSQL 18.x
- Angular CLI 22.x

### Clonar el repositorio

```bash
git clone https://github.com/Juan-pmb/prueba-tecnica-node-angular.git
cd prueba-tecnica-node-angular
```

## Configuración de la base de datos

Crear una base de datos PostgreSQL:

```sql
CREATE DATABASE prueba_tecnica;
```

Crear el usuario de aplicación:

```sql
CREATE USER prueba_app WITH PASSWORD 'TU_PASSWORD';
```

Conceder permisos:

```sql
GRANT ALL PRIVILEGES ON DATABASE prueba_tecnica TO prueba_app;
```

Conectarse a la base de datos:

```sql
\c prueba_tecnica
```

Ejecutar la migración:

```bash
psql -U prueba_app -d prueba_tecnica -f database/migrations/001_initial_schema.sql
```

Ejecutar el seed:

```bash
psql -U prueba_app -d prueba_tecnica -f database/seeds/001_users.sql
```

## Variables de entorno

Crear el archivo:

```text
backend/.env
```

Tomando como referencia `backend/.env.example`.

Ejemplo:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=prueba_tecnica
DB_USER=prueba_app
DB_PASSWORD=TU_PASSWORD
JWT_SECRET=TU_SECRET_KEY
```

No se debe subir el archivo `.env` al repositorio.

## Ejecución del backend

Entrar al directorio:

```bash
cd backend
```

Instalar dependencias:

```bash
npm install
```

Iniciar el servidor:

```bash
npm start
```

Para desarrollo:

```bash
npm run dev
```

El backend queda disponible en:

```text
http://localhost:3000
```

## Ejecución del frontend

Entrar al directorio:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Iniciar Angular:

```bash
npm start
```

El frontend queda disponible en:

```text
http://localhost:4200
```

## Autenticación

La aplicación utiliza JWT para autenticar a los usuarios.

Endpoint:

```text
POST /api/auth/login
```

El token generado debe enviarse posteriormente mediante:

```text
Authorization: Bearer <token>
```

El token tiene una duración limitada y es utilizado para proteger los recursos de la API.

## Roles y permisos

La aplicación implementa tres roles:

### ADMIN

Puede acceder a:

- Dashboard
- Usuarios
- Carga de archivos
- ETL
- Registros
- Errores
- Reportes

### OPERADOR

Puede acceder a:

- Dashboard
- Carga de archivos
- ETL
- Registros
- Errores
- Reportes

No puede acceder a Usuarios.

### CONSULTA

Puede acceder a:

- Dashboard
- Registros
- Errores
- Reportes

No puede acceder a:

- Usuarios
- Carga de archivos
- ETL

## Regla de seguridad 404

Cuando un usuario está autenticado pero no tiene autorización para acceder a un recurso, el backend responde:

```text
404 Not Found
```

en lugar de:

```text
403 Forbidden
```

Esto se implementa tanto en las rutas protegidas como en el control de acceso por roles del backend.

El frontend también utiliza guards para evitar mostrar opciones de navegación que no corresponden al rol del usuario.

## Gestión de usuarios

Los usuarios pueden ser consultados y creados desde la sección de Usuarios.

La creación requiere:

- Nombre
- Email
- Contraseña
- Rol

Las contraseñas se almacenan utilizando hash mediante bcrypt.

## Importación CSV y ETL

La aplicación permite cargar archivos CSV desde los perfiles ADMIN y OPERADOR.

El proceso ETL está dividido conceptualmente en:

### Extract

Se leen las filas del archivo CSV y se conserva el número de fila de origen.

### Transform

Cada registro es validado y normalizado.

Se validan, entre otros:

- Tipo de documento
- Documento
- Nombres
- Apellidos
- Email
- Fecha de nacimiento
- Ciudad
- Estado

Los tipos de documento permitidos son:

```text
CC
CE
TI
```

Los estados permitidos son:

```text
ACTIVO
INACTIVO
```

Los valores de estado y tipo de documento se normalizan para aceptar diferentes combinaciones de mayúsculas y minúsculas.

Las fechas deben ser válidas y consistentes.

### Load

Los registros válidos se almacenan en PostgreSQL.

Los registros inválidos no detienen el procesamiento del archivo. Se registran como errores asociados a la importación.

## Manejo de errores ETL

Los errores de validación almacenan:

- Importación
- Número de fila
- Campo
- Valor recibido
- Descripción del error

Esto permite consultar posteriormente los errores encontrados durante una importación.

Una fila inválida no impide que las demás filas válidas sean procesadas.

## Manejo de duplicados

El documento identifica de manera única a cada registro.

La base de datos utiliza una restricción de unicidad sobre el documento.

Durante la carga se utiliza una estrategia equivalente a:

```sql
ON CONFLICT (document) DO NOTHING
```

Esto evita insertar registros duplicados.

Además, los registros duplicados dentro de un mismo archivo no generan duplicados en la tabla de registros.

Los contadores de la importación representan las filas procesadas y validadas, independientemente de que un registro ya existente haya sido omitido durante la inserción.

## Historial de importaciones

La aplicación conserva información de cada archivo procesado:

- ID
- Nombre original del archivo
- Fecha de carga
- Usuario que realizó la carga
- Total de registros
- Registros válidos
- Registros inválidos
- Estado de la importación

Los archivos originales cargados se conservan en el directorio de uploads del backend.

## Registros

La sección de Registros permite consultar la información procesada.

Incluye:

- Tipo de documento
- Documento
- Nombre
- Apellidos
- Email
- Ciudad
- Fecha de nacimiento
- Estado

La API implementa paginación y permite realizar búsqueda y filtros.

## Errores

La sección de Errores permite consultar los errores registrados durante las importaciones.

La información incluye:

- Importación
- Fila
- Campo
- Valor recibido
- Descripción

La consulta utiliza paginación.

## Dashboard

El dashboard presenta indicadores generales de la aplicación:

- Usuarios registrados
- Archivos procesados
- Registros procesados
- Registros válidos
- Registros inválidos
- Errores registrados

También presenta información resumida sobre importaciones completadas, importaciones con error y estado de los registros.

## Reportes

La sección de Reportes presenta información consolidada sobre:

- Usuarios
- Registros
- Registros activos
- Registros inactivos
- Importaciones
- Importaciones completadas
- Importaciones con error
- Registros procesados
- Registros válidos
- Registros inválidos
- Errores registrados

## Principales endpoints

### Autenticación

```text
POST /api/auth/login
```

### Usuarios

```text
GET  /api/users
POST /api/users
```

### Importaciones

```text
POST /api/imports
GET  /api/imports
GET  /api/imports/:id
GET  /api/imports/:id/errors
```

### Registros

```text
GET /api/records
```

### Reportes

```text
GET /api/reports
```

## Pruebas

### Backend

Desde:

```text
backend/
```

ejecutar:

```bash
npm test
```

Las pruebas cubren, entre otros aspectos:

- Autenticación
- Gestión de usuarios
- Validación de archivos
- Procesamiento ETL
- Registros válidos e inválidos
- Errores de importación
- Detalle de importaciones
- Restricciones por rol
- Manejo de duplicados

Las pruebas de importación realizan limpieza de los datos generados para evitar contaminar el historial de importaciones de la aplicación.

### Frontend

Desde:

```text
frontend/
```

ejecutar:

```bash
npm test
```

Las pruebas cubren componentes y servicios principales, incluyendo:

- Autenticación
- Interceptor JWT
- Layout
- Reportes
- Dashboard

## Credenciales de prueba

### ADMIN

```text
Email: admin@prueba.com
Password: Admin123
```

### OPERADOR

```text
Email: operador@prueba.com
Password: Operador123
```

### CONSULTA

```text
Email: consulta@prueba.com
Password: Consulta123
```

## Decisiones técnicas

### Arquitectura

El backend está organizado por módulos y responsabilidades, separando:

- Controladores
- Servicios
- Middleware
- Configuración
- Procesamiento ETL

El frontend utiliza componentes standalone de Angular y servicios para el consumo de la API.

### Autenticación

Se utiliza JWT para mantener la sesión autenticada.

El token contiene la información necesaria para identificar al usuario y su rol.

### Autorización

La autorización se aplica en el backend mediante middleware de roles.

El frontend utiliza guards para controlar la navegación y ocultar opciones que el usuario no puede utilizar.

La validación del backend es la capa principal de seguridad.

### Respuesta 404 para recursos no autorizados

Se utiliza HTTP 404 para usuarios autenticados que intentan acceder a recursos fuera de sus permisos, siguiendo el requisito específico de la prueba técnica.

### ETL

El procesamiento ETL separa extracción, transformación y carga para facilitar el mantenimiento y las pruebas.

Los errores se almacenan individualmente para que una fila inválida no detenga todo el proceso.

### Duplicados

El documento se utiliza como identificador único del registro.

La restricción de unicidad de PostgreSQL y `ON CONFLICT DO NOTHING` evitan duplicados.

### Paginación

Las consultas de importaciones, registros y errores utilizan paginación en el backend para evitar cargar todos los registros simultáneamente.

## Entregables

El proyecto incluye:

- Frontend Angular
- Backend Node.js + Express
- Base de datos PostgreSQL
- Migraciones
- Seed de usuarios
- Autenticación JWT
- Autorización por roles
- Carga de archivos CSV
- Procesamiento ETL
- Validación de registros
- Manejo de errores
- Historial de importaciones
- Consulta de registros
- Dashboard
- Reportes
- Pruebas automatizadas
- `.env.example`
- `.gitignore`
- Documentación técnica

## Repositorio

Código fuente:

https://github.com/Juan-pmb/prueba-tecnica-node-angular
