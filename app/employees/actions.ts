'use server';

import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createEmployee(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { error: 'No autorizado para realizar esta acción.' };
  }

  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string;
  const email = formData.get('email') as string;
  const fileNumber = formData.get('file_number') as string;
  const departmentId = formData.get('department_id') as string;

  if (!firstName || !lastName || !fileNumber || !departmentId) {
    return { error: 'Por favor, completa todos los campos obligatorios.' };
  }

  try {
    // Verificar si el legajo ya existe
    const existingFile = await sql`
      SELECT id FROM employees WHERE file_number = ${fileNumber.trim()}
    `;
    if (existingFile.length > 0) {
      return { error: 'El número de legajo ya se encuentra registrado.' };
    }

    // Verificar si el correo ya existe (si se ingresó)
    if (email) {
      const existingEmail = await sql`
        SELECT id FROM employees WHERE email = ${email.toLowerCase().trim()}
      `;
      if (existingEmail.length > 0) {
        return { error: 'El correo electrónico ya se encuentra registrado.' };
      }
    }

    // Insertar empleado
    await sql`
      INSERT INTO employees (first_name, last_name, email, file_number, department_id, is_active)
      VALUES (
        ${firstName.trim()}, 
        ${lastName.trim()}, 
        ${email ? email.toLowerCase().trim() : null}, 
        ${fileNumber.trim()}, 
        ${departmentId},
        true
      )
    `;

  } catch (error) {
    console.error('Error al crear empleado:', error);
    return { error: 'Ocurrió un error al guardar en la base de datos.' };
  }

  revalidatePath('/employees');
  redirect('/employees');
}

export async function updateEmployee(id: string, prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { error: 'No autorizado para realizar esta acción.' };
  }

  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string;
  const email = formData.get('email') as string;
  const fileNumber = formData.get('file_number') as string;
  const departmentId = formData.get('department_id') as string;
  const isActive = formData.get('is_active') === 'true';

  if (!firstName || !lastName || !fileNumber || !departmentId) {
    return { error: 'Por favor, completa todos los campos obligatorios.' };
  }

  try {
    // Verificar que el legajo no esté duplicado por otro empleado
    const existingFile = await sql`
      SELECT id FROM employees WHERE file_number = ${fileNumber.trim()} AND id != ${id}
    `;
    if (existingFile.length > 0) {
      return { error: 'El número de legajo ya está registrado en otro empleado.' };
    }

    // Verificar que el correo no esté duplicado por otro empleado
    if (email) {
      const existingEmail = await sql`
        SELECT id FROM employees WHERE email = ${email.toLowerCase().trim()} AND id != ${id}
      `;
      if (existingEmail.length > 0) {
        return { error: 'El correo electrónico ya está registrado en otro empleado.' };
      }
    }

    // Actualizar empleado
    await sql`
      UPDATE employees 
      SET 
        first_name = ${firstName.trim()},
        last_name = ${lastName.trim()},
        email = ${email ? email.toLowerCase().trim() : null},
        file_number = ${fileNumber.trim()},
        department_id = ${departmentId},
        is_active = ${isActive}
      WHERE id = ${id}
    `;

  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    return { error: 'Ocurrió un error al guardar los cambios.' };
  }

  revalidatePath('/employees');
  redirect('/employees');
}
