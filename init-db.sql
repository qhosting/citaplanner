
-- Inicialización de la base de datos CitaPlanner
-- Este archivo se ejecuta automáticamente al crear el contenedor de PostgreSQL

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Mensaje de confirmación
SELECT 'CitaPlanner database initialized successfully' AS status;
