import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import EditForm from './EditForm';
import { redirect } from 'next/navigation';

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  // Redirigir si no está autenticado o no es administrador
  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'admin') {
    redirect('/');
  }

  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Obtener los datos del empleado
  const employeeRes = await sql`
    SELECT id, first_name, last_name, email, file_number, department_id, is_active
    FROM employees
    WHERE id = ${id}
  `;

  if (employeeRes.length === 0) {
    redirect('/employees');
  }

  // Obtener departamentos
  const departments = await sql`
    SELECT id, name FROM departments ORDER BY name
  `;

  const typedDepartments = departments.map(d => ({
    id: d.id as string,
    name: d.name as string,
  }));

  // Asegurarnos de que coincidan los tipos
  const employee = {
    id: employeeRes[0].id as string,
    first_name: employeeRes[0].first_name as string,
    last_name: employeeRes[0].last_name as string,
    email: employeeRes[0].email as string | null,
    file_number: employeeRes[0].file_number as string,
    department_id: employeeRes[0].department_id as string,
    is_active: employeeRes[0].is_active as boolean,
  };

  return <EditForm employee={employee} departments={typedDepartments} />;
}
