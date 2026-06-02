import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { getDatabaseSchema, getSearchPath, shouldUseSsl } from '../lib/db-config';
import { loadLocalEnv } from './load-local-env';

// Cargar variables de entorno desde .env.local
const projectDir = process.cwd();
loadLocalEnv(projectDir);

const connectionString = process.env.DATABASE_URL;
const schema = getDatabaseSchema();
if (!connectionString) {
  console.error('DATABASE_URL no está definida en las variables de entorno (.env.local)');
  process.exit(1);
}

const sql = postgres(connectionString, {
  ssl: shouldUseSsl(connectionString) ? 'require' : false,
  connection: {
    application_name: 'absence-control-seed',
    search_path: getSearchPath(schema),
  },
});

async function main() {
  try {
    console.log('Iniciando inicialización de Base de Datos...');

    // Leer el archivo schema.sql
    const schemaPath = path.join(projectDir, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`No se encontró el archivo schema.sql en ${schemaPath}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Ejecutar el script SQL para crear las tablas
    console.log('Ejecutando schema.sql...');
    await sql.unsafe(schemaSql);
    console.log('Tablas y restricciones creadas.');

    // Verificar si ya hay usuarios creados para no duplicar datos
    const existingUsers = await sql`SELECT COUNT(*)::int as count FROM users`;
    if (existingUsers[0].count > 0) {
      console.log('La base de datos ya contiene datos. Omitiendo seed.');
      return;
    }

    console.log('Insertando datos semilla (seed)...');

    // 1. Crear usuarios administradores y lectores
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const readerPasswordHash = await bcrypt.hash('reader123', 10);

    const [adminUser] = await sql`
      INSERT INTO users (email, password_hash, role, name)
      VALUES ('admin@absence.com', ${adminPasswordHash}, 'admin', 'Administrador Principal')
      RETURNING id
    `;

    await sql`
      INSERT INTO users (email, password_hash, role, name)
      VALUES ('reader@absence.com', ${readerPasswordHash}, 'reader', 'Lector de Informes')
    `;

    console.log('Usuarios del sistema insertados:');
    console.log('  - Admin: admin@absence.com / admin123');
    console.log('  - Lector: reader@absence.com / reader123');

    // 2. Insertar departamentos
    const depts = [
      'Matemáticas y Física',
      'Lengua y Literatura',
      'Ciencias Naturales',
      'Educación Física',
      'Administración y Bedelía',
    ];
    const deptIds: string[] = [];

    for (const name of depts) {
      const [dept] = await sql`
        INSERT INTO departments (name)
        VALUES (${name})
        RETURNING id
      `;
      deptIds.push(dept.id);
    }
    console.log(`${deptIds.length} departamentos creados.`);

    // 3. Insertar tipos de ausencias
    const absenceTypes = [
      { name: 'Licencia Médica (con Certificado)', requires_certificate: true },
      { name: 'Día Particular / Asuntos Propios', requires_certificate: false },
      { name: 'Licencia por Examen', requires_certificate: true },
      { name: 'Vacaciones Anuales', requires_certificate: false },
      { name: 'Capacitación Docente / Congreso', requires_certificate: true },
      { name: 'Fuerza Mayor / Suspensión de Transporte', requires_certificate: false },
    ];

    for (const type of absenceTypes) {
      await sql`
        INSERT INTO absence_types (name, requires_certificate)
        VALUES (${type.name}, ${type.requires_certificate})
      `;
    }
    console.log('Tipos de ausencia creados.');

    // 4. Insertar empleados de prueba
    const employees = [
      { first_name: 'María Laura', last_name: 'González', email: 'maria.gonzalez@colegio.edu.ar', file_number: 'LEG-1001', deptIdx: 0 },
      { first_name: 'Carlos Alberto', last_name: 'Rodríguez', email: 'carlos.rodriguez@colegio.edu.ar', file_number: 'LEG-1002', deptIdx: 0 },
      { first_name: 'Ana María', last_name: 'Martínez', email: 'ana.martinez@colegio.edu.ar', file_number: 'LEG-1003', deptIdx: 1 },
      { first_name: 'José Luis', last_name: 'Gómez', email: 'jose.gomez@colegio.edu.ar', file_number: 'LEG-1004', deptIdx: 2 },
      { first_name: 'Patricia Inés', last_name: 'Fernández', email: 'patricia.fernandez@colegio.edu.ar', file_number: 'LEG-1005', deptIdx: 3 },
      { first_name: 'Jorge Daniel', last_name: 'López', email: 'jorge.lopez@colegio.edu.ar', file_number: 'LEG-1006', deptIdx: 4 },
    ];

    for (const emp of employees) {
      await sql`
        INSERT INTO employees (first_name, last_name, email, file_number, department_id)
        VALUES (${emp.first_name}, ${emp.last_name}, ${emp.email}, ${emp.file_number}, ${deptIds[emp.deptIdx]})
      `;
    }
    console.log(`${employees.length} empleados insertados.`);

    // 5. Agregar algunas ausencias históricas para que el dashboard empiece con datos
    // Buscar id del tipo de ausencia médica (id 1) y día particular (id 2)
    const absenceTypesList = await sql`SELECT id, name FROM absence_types`;
    const medicaId = absenceTypesList.find(t => t.name.includes('Médica'))?.id || 1;
    const particularId = absenceTypesList.find(t => t.name.includes('Particular'))?.id || 2;

    const employeesList = await sql`SELECT id FROM employees`;
    
    // Ausencia 1: María González estuvo enferma 3 días
    await sql`
      INSERT INTO absences (employee_id, absence_type_id, start_date, end_date, reason, certificate_attached, created_by)
      VALUES (
        ${employeesList[0].id}, 
        ${medicaId}, 
        CURRENT_DATE - INTERVAL '10 days', 
        CURRENT_DATE - INTERVAL '8 days', 
        'Gripe severa con reposo indicado.', 
        TRUE, 
        ${adminUser.id}
      )
    `;

    // Ausencia 2: Carlos Rodríguez día particular hoy
    await sql`
      INSERT INTO absences (employee_id, absence_type_id, start_date, end_date, reason, certificate_attached, created_by)
      VALUES (
        ${employeesList[1].id}, 
        ${particularId}, 
        CURRENT_DATE, 
        CURRENT_DATE, 
        'Trámite inmobiliario impostergable.', 
        FALSE, 
        ${adminUser.id}
      )
    `;

    // Ausencia 3: Ana Martínez examen
    const examenId = absenceTypesList.find(t => t.name.includes('Examen'))?.id || 3;
    await sql`
      INSERT INTO absences (employee_id, absence_type_id, start_date, end_date, reason, certificate_attached, created_by)
      VALUES (
        ${employeesList[2].id}, 
        ${examenId}, 
        CURRENT_DATE - INTERVAL '4 days', 
        CURRENT_DATE - INTERVAL '3 days', 
        'Rinde final de carrera universitaria.', 
        TRUE, 
        ${adminUser.id}
      )
    `;

    console.log('Ausencias de prueba creadas.');
    console.log('¡Base de datos inicializada y poblada con éxito!');
  } catch (error) {
    console.error('Error durante la inicialización de la base de datos:', error);
  } finally {
    await sql.end();
  }
}

main();
