'use server';

import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import sql from '@/lib/db';
import { encrypt } from '@/lib/auth';

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Por favor, completa todos los campos.' };
  }

  try {
    // Buscar usuario en la base de datos
    const users = await sql`
      SELECT id, email, password_hash, role, name 
      FROM users 
      WHERE email = ${email.toLowerCase().trim()}
    `;

    if (users.length === 0) {
      return { error: 'Correo electrónico o contraseña incorrectos.' };
    }

    const user = users[0];

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return { error: 'Correo electrónico o contraseña incorrectos.' };
    }

    // Generar token JWT cifrado
    const sessionToken = await encrypt({
      id: user.id,
      email: user.email,
      role: user.role as 'admin' | 'reader',
      name: user.name,
    });

    // Establecer la cookie de sesión
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 día en segundos
    });

  } catch (error) {
    console.error('Error en loginAction:', error);
    return { error: 'Ocurrió un error en el servidor. Inténtalo de nuevo.' };
  }

  // Redirigir al home (dashboard)
  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}
