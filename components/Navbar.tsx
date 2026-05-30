'use client';

import { usePathname } from 'next/navigation';
import { Calendar, Plus } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  session: {
    id: string;
    email: string;
    role: 'admin' | 'reader';
    name: string;
  };
}

export default function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();

  // Formatear fecha actual en español
  const getFormattedDate = () => {
    const today = new Date();
    return today.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Obtener el título dinámico de la página
  const getPageTitle = () => {
    if (pathname === '/') return 'Resumen General';
    if (pathname.startsWith('/absences')) {
      if (pathname.includes('/register')) return 'Registrar Ausencia';
      if (pathname.includes('/edit')) return 'Modificar Ausencia';
      return 'Gestión de Ausencias';
    }
    if (pathname.startsWith('/employees')) {
      if (pathname.includes('/create')) return 'Registrar Empleado';
      if (pathname.includes('/edit')) return 'Modificar Empleado';
      return 'Gestión de Empleados';
    }
    if (pathname.startsWith('/reports')) return 'Reportes y Descargas';
    return 'Sistema';
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Page Title */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">{getPageTitle()}</h2>
      </div>

      {/* Right Tools: Date and Actions */}
      <div className="flex items-center gap-6">
        {/* Current Date */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 px-3 py-1.5 border border-slate-800/60 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span className="capitalize">{getFormattedDate()}</span>
        </div>

        {/* Quick Action Button for Admin Only */}
        {session.role === 'admin' && (
          <Link
            href="/absences/register"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs transition-all duration-200 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Ausencia</span>
          </Link>
        )}
      </div>
    </header>
  );
}
