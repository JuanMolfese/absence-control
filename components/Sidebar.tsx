'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  FileSpreadsheet, 
  LogOut,
  UserCheck
} from 'lucide-react';
import { logoutAction } from '@/app/login/actions';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  session: {
    id: string;
    email: string;
    role: 'admin' | 'reader';
    name: string;
  };
}

export default function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
  };

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      roles: ['admin', 'reader'],
    },
    {
      name: 'Ausencias',
      href: '/absences',
      icon: CalendarDays,
      roles: ['admin', 'reader'],
    },
    {
      name: 'Empleados / Docentes',
      href: '/employees',
      icon: Users,
      roles: ['admin', 'reader'],
    },
    {
      name: 'Reportes y Descargas',
      href: '/reports',
      icon: FileSpreadsheet,
      roles: ['admin', 'reader'],
    },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(session.role));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col min-h-screen">
      {/* Header Logo */}
      <div className="h-16 px-6 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/20">
          AC
        </div>
        <div>
          <span className="font-bold text-white tracking-wide block leading-none">Absence</span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Control System</span>
        </div>
      </div>

      {/* User Information Profile */}
      <div className="p-4 mx-4 my-6 bg-slate-950/60 border border-slate-800/60 rounded-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-semibold shadow-inner">
          {session.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-200 truncate">{session.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <UserCheck className="w-3 h-3 text-indigo-400" />
            <span className="text-[10px] text-slate-400 font-medium capitalize">
              {session.role === 'admin' ? 'Administrador' : 'Lector'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 space-y-1">
        {filteredMenu.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-indigo-500/20 text-indigo-400 shadow-md shadow-indigo-600/5'
                  : 'text-slate-400 border border-transparent hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-800/80 text-slate-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-sm font-medium transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
