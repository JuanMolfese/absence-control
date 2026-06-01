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
      return 'Gestión de Iniasistencias';
    }
    if (pathname.startsWith('/employees')) {
      if (pathname.includes('/create')) return 'Registrar Docente';
      if (pathname.includes('/edit')) return 'Modificar Docente';
      return 'Gestión de Docentes';
    }
    if (pathname.startsWith('/reports')) return 'Reportes y Descargas';
    return 'Sistema';
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/40 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Page Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{getPageTitle()}</h2>
      </div>

      {/* Right Tools: Date and Actions */}
      <div className="flex items-center gap-6">
        {/* Current Date */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 border border-slate-300 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-emerald-700" />
          <span className="capitalize">{getFormattedDate()}</span>
        </div>

        {/* Quick Action Button for Admin Only */}
       {/*  {session.role === 'admin' && (
          <Link
            href="/absences/register"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-700 hover:to-emerald-500 text-white font-medium text-xs transition-all duration-200 shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Ausencia</span>
          </Link>
        )} */}
      </div>
    </header>
  );
}
