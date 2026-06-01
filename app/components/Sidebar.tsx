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
      name: 'Docentes',
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
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col min-h-screen">
      {/* Header Logo */}
      <div className="h-16 px-6 border-b border-slate-200 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-600/20">
          15
        </div>
        <div>
          <span className="font-bold text-sm text-slate-900 tracking-wide block leading-none">Gestion de ausencias</span>          
        </div>
      </div>

      {/* User Information Profile */}
      <div className="p-4 mx-4 my-6 bg-slate-100 border border-slate-300 rounded-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 border border-emerald-600/30 flex items-center justify-center text-emerald-700 font-semibold shadow-inner">
          {session.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-800 truncate">{session.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <UserCheck className="w-3 h-3 text-emerald-700" />
            <span className="text-[10px] text-slate-600 font-medium capitalize">
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
                  ? 'bg-gradient-to-r from-emerald-700/10 to-emerald-600/10 border border-emerald-500/20 text-emerald-700 shadow-md shadow-emerald-600/5'
                  : 'text-slate-600 border border-transparent hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-red-100 hover:border-red-300 hover:text-red-700 text-sm font-medium transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
