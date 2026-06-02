import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import { getSearchPath, shouldUseSsl } from '../lib/db-config';
import { loadLocalEnv } from './load-local-env';

const projectDir = process.cwd();
loadLocalEnv(projectDir);

const localConnectionString = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;
const remoteConnectionString =
  process.env.REMOTE_DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL;

const localSchema = (process.env.LOCAL_DATABASE_SCHEMA || process.env.DATABASE_SCHEMA || 'absence_control').trim();
const remoteSchema = (process.env.REMOTE_DATABASE_SCHEMA || 'absence_control').trim();

if (!localConnectionString) {
  console.error('Falta LOCAL_DATABASE_URL o DATABASE_URL para leer la base local.');
  process.exit(1);
}

if (!remoteConnectionString) {
  console.error('Falta REMOTE_DATABASE_URL en .env.local para copiar datos al remoto.');
  process.exit(1);
}

if (remoteSchema !== 'absence_control') {
  console.error('Este script basico asume que el schema remoto es "absence_control".');
  process.exit(1);
}

const local = postgres(localConnectionString, {
  ssl: shouldUseSsl(localConnectionString) ? 'require' : false,
  connection: {
    application_name: 'absence-control-sync-local',
    search_path: getSearchPath(localSchema),
  },
});

const remote = postgres(remoteConnectionString, {
  ssl: shouldUseSsl(remoteConnectionString) ? 'require' : false,
  connection: {
    application_name: 'absence-control-sync-remote',
    search_path: getSearchPath(remoteSchema),
  },
});

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'reader';
  name: string;
  created_at: Date;
};

type DepartmentRow = {
  id: string;
  name: string;
  created_at: Date;
};

type AbsenceTypeRow = {
  id: number;
  name: string;
  requires_certificate: boolean;
};

type EmployeeRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  file_number: string;
  department_id: string;
  is_active: boolean;
  created_at: Date;
};

type AbsenceRow = {
  id: string;
  employee_id: string;
  absence_type_id: number;
  start_date: string;
  end_date: string;
  reason: string | null;
  certificate_attached: boolean;
  created_by: string | null;
  created_at: Date;
};

async function main() {
  try {
    console.log('Leyendo datos desde la base local...');

    const [users, departments, absenceTypes, employees, absences] = await Promise.all([
      local<UserRow[]>`SELECT id, email, password_hash, role, name, created_at FROM users ORDER BY created_at, id`,
      local<DepartmentRow[]>`SELECT id, name, created_at FROM departments ORDER BY created_at, id`,
      local<AbsenceTypeRow[]>`SELECT id, name, requires_certificate FROM absence_types ORDER BY id`,
      local<EmployeeRow[]>`SELECT id, first_name, last_name, email, file_number, department_id, is_active, created_at FROM employees ORDER BY created_at, id`,
      local<AbsenceRow[]>`SELECT id, employee_id, absence_type_id, start_date::text, end_date::text, reason, certificate_attached, created_by, created_at FROM absences ORDER BY created_at, id`,
    ]);

    console.log(`Usuarios locales: ${users.length}`);
    console.log(`Departamentos locales: ${departments.length}`);
    console.log(`Tipos de ausencia locales: ${absenceTypes.length}`);
    console.log(`Empleados locales: ${employees.length}`);
    console.log(`Ausencias locales: ${absences.length}`);

    const schemaPath = path.join(projectDir, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Preparando schema remoto...');
    await remote.unsafe(schemaSql);

    await remote.begin(async (tx) => {
      console.log('Limpiando tablas remotas...');
      await tx.unsafe('TRUNCATE TABLE absences, employees, absence_types, departments, users RESTART IDENTITY CASCADE');

      if (users.length > 0) {
        await tx`INSERT INTO users ${tx(users, 'id', 'email', 'password_hash', 'role', 'name', 'created_at')}`;
      }

      if (departments.length > 0) {
        await tx`INSERT INTO departments ${tx(departments, 'id', 'name', 'created_at')}`;
      }

      if (absenceTypes.length > 0) {
        await tx`INSERT INTO absence_types ${tx(absenceTypes, 'id', 'name', 'requires_certificate')}`;
      }

      if (employees.length > 0) {
        await tx`INSERT INTO employees ${tx(employees, 'id', 'first_name', 'last_name', 'email', 'file_number', 'department_id', 'is_active', 'created_at')}`;
      }

      if (absences.length > 0) {
        await tx`INSERT INTO absences ${tx(absences, 'id', 'employee_id', 'absence_type_id', 'start_date', 'end_date', 'reason', 'certificate_attached', 'created_by', 'created_at')}`;
      }

      await tx.unsafe(`
        SELECT setval(
          pg_get_serial_sequence('absence_types', 'id'),
          COALESCE((SELECT MAX(id) FROM absence_types), 1),
          (SELECT COUNT(*) > 0 FROM absence_types)
        )
      `);
    });

    console.log('Sincronizacion completada: local -> remoto.');
    console.log('Credenciales preservadas: admin@absence.com / admin123 y reader@absence.com / reader123');
  } catch (error) {
    console.error('Fallo la sincronizacion local -> remoto:', error);
    process.exitCode = 1;
  } finally {
    await Promise.all([local.end(), remote.end()]);
  }
}

main();
