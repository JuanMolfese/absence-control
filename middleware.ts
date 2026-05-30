import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-me'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas (login, archivos estáticos, api de auth si no es protegida)
  const isPublicRoute =
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.');

  const sessionToken = request.cookies.get('session')?.value;

  // Si no está logueado y va a una ruta protegida
  if (!sessionToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si está logueado y va al login
  if (sessionToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Control de roles si está logueado
  if (sessionToken && !isPublicRoute) {
    try {
      const { payload } = await jwtVerify(sessionToken, JWT_SECRET, {
        algorithms: ['HS256'],
      });

      const userRole = payload.role as string;

      // Rutas de administración (creación, edición, borrado)
      // Ejemplo: /employees (ver es lector/admin, pero rutas de modificación o registro son solo admin)
      const isAdminRoute =
        pathname.startsWith('/employees/create') ||
        pathname.startsWith('/absences/register') ||
        pathname.startsWith('/absences/edit');

      if (isAdminRoute && userRole !== 'admin') {
        // Redireccionar al dashboard si un Lector intenta modificar cosas
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // Token inválido o expirado: borrar cookie y mandar al login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

// Configurar qué rutas activan el middleware
export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto las que empiezan con:
     * - api (rutas api que no sean protegidas, aunque podemos dejarlas)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono del navegador)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
