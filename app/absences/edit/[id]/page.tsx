import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import EditAbsenceForm from './EditAbsenceForm';
import { redirect } from 'next/navigation';

export default async function EditAbsencePage({
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

  // Obtener los datos de la ausencia
  const absencesRes = await sql`
    SELECT id, employee_id, absence_type_id, start_date, end_date, reason, certificate_attached
    FROM absences
    WHERE id = ${id}
  `;

  if (absencesRes.length === 0) {
    redirect('/absences');
  }

  const absenceData = absencesRes[0];

  // Obtener empleados activos, o el empleado asignado a esta ausencia en particular
  const employees = await sql`
    SELECT id, first_name, last_name, file_number 
    FROM employees 
    WHERE is_active = true OR id = ${absenceData.employee_id}
    ORDER BY last_name, first_name
  `;

  // Obtener tipos de ausencia
  const absenceTypes = await sql`
    SELECT id, name, requires_certificate 
    FROM absence_types 
    ORDER BY name
  `;

  const absence = {
    id: absenceData.id,
    employee_id: absenceData.employee_id,
    absence_type_id: absenceData.absence_type_id,
    start_date: absenceData.start_date,
    end_date: absenceData.end_date,
    reason: absenceData.reason,
    certificate_attached: absenceData.certificate_attached,
  };

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

  return (
    <EditAbsenceForm 
      absence={absence} 
      employees={typedEmployees} 
      absenceTypes={typedAbsenceTypes} 
    />
  );
}
