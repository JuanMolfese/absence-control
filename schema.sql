-- Habilitar extensión pgcrypto para uuid (opcional, en pg13+ gen_random_uuid() es nativo)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Crear el esquema "absence_control" si no existe
CREATE SCHEMA IF NOT EXISTS absence_control;

-- Establecer el search_path para que las tablas se creen en el esquema absence_control por defecto
SET search_path TO absence_control, public;

-- Tabla de Usuarios del Sistema
CREATE TABLE IF NOT EXISTS absence_control.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'reader')),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Departamentos / Equipos / Sectores
CREATE TABLE IF NOT EXISTS absence_control.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Empleados (ej. Personal Docente, Personal Administrativo, etc.)
CREATE TABLE IF NOT EXISTS absence_control.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    file_number VARCHAR(100) UNIQUE NOT NULL, -- Legajo o Matrícula
    department_id UUID NOT NULL REFERENCES absence_control.departments(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Tipos de Ausencia (motivos)
CREATE TABLE IF NOT EXISTS absence_control.absence_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL, -- Ej: "Licencia Médica", "Día Particular", "Vacaciones", "Maternidad/Paternidad"
    requires_certificate BOOLEAN DEFAULT FALSE NOT NULL
);

-- Tabla de Registro de Ausencias
CREATE TABLE IF NOT EXISTS absence_control.absences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES absence_control.employees(id) ON DELETE CASCADE,
    absence_type_id INTEGER NOT NULL REFERENCES absence_control.absence_types(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT, -- Observaciones o detalles adicionales
    certificate_attached BOOLEAN DEFAULT FALSE NOT NULL, -- Si presentó certificado físico/digital
    created_by UUID REFERENCES absence_control.users(id) ON DELETE SET NULL, -- Quién registró la ausencia en el sistema
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_dates CHECK (start_date <= end_date)
);

-- Crear índices para optimizar búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_absences_employee ON absence_control.absences(employee_id);
CREATE INDEX IF NOT EXISTS idx_absences_dates ON absence_control.absences(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_employees_department ON absence_control.employees(department_id);
