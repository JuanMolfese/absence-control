import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import EmployeeForm from './EmployeeForm';
import { redirect } from 'next/navigation';

export default async function CreateEmployeePage() {
  const session = await getSession();

  // Redirigir si no está autenticado o no es administrador
  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'admin') {
    redirect('/');
  }

  // Obtener departamentos desde la base de datos
  const departments = await sql`
    SELECT id, name FROM departments ORDER BY name
  `;

  const typedDepartments = departments.map(d => ({
    id: d.id as string,
    name: d.name as string,
  }));

  return <EmployeeForm departments={typedDepartments} />;
}
