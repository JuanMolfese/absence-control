'use server';

import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function registerAbsence(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { error: 'No autorizado para realizar esta acción.' };
  }

  const employeeId = formData.get('employee_id') as string;
  const absenceTypeIdStr = formData.get('absence_type_id') as string;
  const startDateStr = formData.get('start_date') as string;
  const endDateStr = formData.get('end_date') as string;
  const reason = formData.get('reason') as string;
  const certificateAttached = formData.get('certificate_attached') === 'true';

  if (!employeeId || !absenceTypeIdStr || !startDateStr || !endDateStr) {
    return { error: 'Por favor, completa todos los campos obligatorios.' };
  }

  const absenceTypeId = parseInt(absenceTypeIdStr);
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { error: 'Formato de fecha inválido.' };
  }

  if (startDate > endDate) {
    return { error: 'La fecha de inicio no puede ser posterior a la fecha de fin.' };
  }

  try {
    // Registrar la ausencia
    await sql`
      INSERT INTO absences (
        employee_id, 
        absence_type_id, 
        start_date, 
        end_date, 
        reason, 
        certificate_attached, 
        created_by
      )
      VALUES (
        ${employeeId}, 
        ${absenceTypeId}, 
        ${startDateStr}, 
        ${endDateStr}, 
        ${reason ? reason.trim() : null}, 
        ${certificateAttached}, 
        ${session.id}
      )
    `;

  } catch (error) {
    console.error('Error al registrar ausencia:', error);
    return { error: 'Ocurrió un error al registrar la ausencia en la base de datos.' };
  }

  revalidatePath('/absences');
  revalidatePath('/');
  redirect('/absences');
}

export async function updateAbsence(id: string, prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { error: 'No autorizado para realizar esta acción.' };
  }

  const employeeId = formData.get('employee_id') as string;
  const absenceTypeIdStr = formData.get('absence_type_id') as string;
  const startDateStr = formData.get('start_date') as string;
  const endDateStr = formData.get('end_date') as string;
  const reason = formData.get('reason') as string;
  const certificateAttached = formData.get('certificate_attached') === 'true';

  if (!employeeId || !absenceTypeIdStr || !startDateStr || !endDateStr) {
    return { error: 'Por favor, completa todos los campos obligatorios.' };
  }

  const absenceTypeId = parseInt(absenceTypeIdStr);
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { error: 'Formato de fecha inválido.' };
  }

  if (startDate > endDate) {
    return { error: 'La fecha de inicio no puede ser posterior a la fecha de fin.' };
  }

  try {
    // Actualizar la ausencia
    await sql`
      UPDATE absences 
      SET 
        employee_id = ${employeeId},
        absence_type_id = ${absenceTypeId},
        start_date = ${startDateStr},
        end_date = ${endDateStr},
        reason = ${reason ? reason.trim() : null},
        certificate_attached = ${certificateAttached}
      WHERE id = ${id}
    `;

  } catch (error) {
    console.error('Error al actualizar ausencia:', error);
    return { error: 'Ocurrió un error al guardar los cambios de la ausencia.' };
  }

  revalidatePath('/absences');
  revalidatePath('/');
  redirect('/absences');
}

export async function deleteAbsence(id: string) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    throw new Error('No autorizado.');
  }

  try {
    await sql`DELETE FROM absences WHERE id = ${id}`;
    revalidatePath('/absences');
    revalidatePath('/');
  } catch (error) {
    console.error('Error al eliminar ausencia:', error);
    throw new Error('No se pudo eliminar la ausencia.');
  }
}
