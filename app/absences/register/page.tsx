import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import RegisterForm from './RegisterForm';
import { redirect } from 'next/navigation';

export default async function RegisterAbsencePage() {
  const session = await getSession();

  // Redirigir si no está autenticado o no es administrador
  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'admin') {
    redirect('/');
  }

  // Obtener empleados activos y tipos de ausencia
  const employees = await sql`
    SELECT id, first_name, last_name, file_number 
    FROM employees 
    WHERE is_active = true 
    ORDER BY last_name, first_name
  `;

  const absenceTypes = await sql`
    SELECT id, name, requires_certificate 
    FROM absence_types 
    ORDER BY name
  `;

  // Tipar adecuadamente para evitar warnings
  const typedEmployees = employees.map(emp => ({
    id: emp.id,
    first_name: emp.first_name,
    last_name: emp.last_name,
    file_number: emp.file_number,
  }));

  const typedAbsenceTypes = absenceTypes.map(type => ({
    id: type.id,
    name: type.name,
    requires_certificate: type.requires_certificate,
  }));

  return <RegisterForm employees={typedEmployees} absenceTypes={typedAbsenceTypes} />;
}
