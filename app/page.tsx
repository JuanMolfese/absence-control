import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) return null;

  // 1. Ejecutar consultas directas para las estadísticas rápidas
  const totalEmployeesRes = await sql`SELECT count(*)::int as count FROM employees WHERE is_active = true`;
  const totalEmployees = totalEmployeesRes[0].count;

  const absencesTodayRes = await sql`
    SELECT count(*)::int as count 
    FROM absences 
    WHERE CURRENT_DATE BETWEEN start_date AND end_date
  `;
  const absencesToday = absencesTodayRes[0].count;

  const absencesThisMonthRes = await sql`
    SELECT count(*)::int as count 
    FROM absences 
    WHERE DATE_TRUNC('month', start_date) = DATE_TRUNC('month', CURRENT_DATE)
  `;
  const absencesThisMonth = absencesThisMonthRes[0].count;

  const pendingCertificatesRes = await sql`
    SELECT count(*)::int as count 
    FROM absences a
    JOIN absence_types t ON a.absence_type_id = t.id
    WHERE t.requires_certificate = true AND a.certificate_attached = false
  `;
  const pendingCertificates = pendingCertificatesRes[0].count;

  // 2. Traer las últimas 5 ausencias registradas
  const recentAbsences = await sql`
    SELECT 
      a.id,
      e.first_name,
      e.last_name,
      e.file_number,
      d.name as department_name,
      t.name as absence_type_name,
      a.start_date,
      a.end_date,
      a.certificate_attached,
      t.requires_certificate,
      a.reason
    FROM absences a
    JOIN employees e ON a.employee_id = e.id
    JOIN departments d ON e.department_id = d.id
    JOIN absence_types t ON a.absence_type_id = t.id
    ORDER BY a.created_at DESC
    LIMIT 5
  `;

  // Formatear fechas para mostrar de forma amigable
  const formatDate = (dateString: string | Date) => {
    const d = new Date(dateString);
    // Ajustar por la zona horaria local
    const userTimezoneOffset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() + userTimezoneOffset);
    return localDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const statCards = [
    {
      title: 'Total Docentes',
      value: totalEmployees,
      icon: Users,
      color: 'from-emerald-800 to-emerald-600',
      description: 'Personal activo registrado en el sistema',
    },
    {
      title: 'Ausencias Hoy',
      value: absencesToday,
      icon: Calendar,
      color: 'from-amber-500 to-orange-600',
      description: 'Personal ausente en la fecha actual',
    },
    {
      title: 'Ausencias del Mes',
      value: absencesThisMonth,
      icon: TrendingUp,
      color: 'from-emerald-700 to-emerald-600',
      description: 'Ausencias acumuladas en este mes calendario',
    },
    {
      title: 'Certificados Pendientes',
      value: pendingCertificates,
      icon: AlertTriangle,
      color: 'from-rose-500 to-red-600',
      description: 'Licencias médicas que requieren certificado pendiente',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Mensaje de bienvenida */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">¡Hola, {session.name}!</h1>
        <p className="text-slate-600 text-sm mt-1">
          Aquí tienes un resumen de la actividad de asistencia del personal docente y no docente.
        </p>
      </div>

      {/* Grid de Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i} 
              className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-slate-300/80 group shadow-sm hover:shadow-md"
            >
              {/* Degradado de decoración de fondo en hover */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-[0.08] transition-all duration-300 rounded-bl-full`} />
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${card.color} text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</span>
                <p className="text-xs text-slate-600 mt-2 line-clamp-1">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sección principal: Historial Reciente y Accesos Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historial Reciente */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-md font-bold text-slate-900">Últimas Ausencias Registradas</h3>
              <p className="text-slate-600 text-xs mt-0.5">Historial de las últimas inasistencias cargadas</p>
            </div>
            <Link 
              href="/absences" 
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition-all"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentAbsences.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-slate-500">
                <Clock className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-700">No hay ausencias registradas aún</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 text-xs font-semibold uppercase">
                    <th className="pb-3">Docente</th>
                    <th className="pb-3">Dpto / Equipo</th>
                    <th className="pb-3">Motivo</th>
                    <th className="pb-3">Periodo</th>
                    <th className="pb-3 text-center">Certificado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {recentAbsences.map((ab) => (
                    <tr key={ab.id} className="hover:bg-slate-50/60 group transition-colors">
                      <td className="py-4 pr-3">
                        <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {ab.last_name}, {ab.first_name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{ab.file_number}</div>
                      </td>
                      <td className="py-4 pr-3 text-slate-600 text-xs">{ab.department_name}</td>
                      <td className="py-4 pr-3">
                        <span className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-300">
                          {ab.absence_type_name}
                        </span>
                      </td>
                      <td className="py-4 pr-3 text-xs">
                        <span className="font-medium text-slate-800">
                          {formatDate(ab.start_date)}
                        </span>
                        {ab.start_date.toString() !== ab.end_date.toString() && (
                          <>
                            <span className="text-slate-400 mx-1">al</span>
                            <span className="font-medium text-slate-800">
                              {formatDate(ab.end_date)}
                            </span>
                          </>
                        )}
                      </td>
                      <td className="py-4 text-center">
                        {!ab.requires_certificate ? (
                          <span className="text-[10px] text-slate-600 bg-slate-200 px-2 py-0.5 rounded border border-slate-300 font-medium">N/A</span>
                        ) : ab.certificate_attached ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Presentado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200 font-medium animate-pulse">
                            <XCircle className="w-3 h-3" />
                            Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Panel de Acciones Rápidas y Ayuda */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-md font-bold text-slate-900">Accesos Rápidos</h3>
            <p className="text-slate-600 text-xs mt-0.5">Acciones más utilizadas del sistema</p>
          </div>

          <div className="space-y-3">
            {session.role === 'admin' && (
              <>
                <Link
                  href="/absences/register"
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500/40 hover:bg-emerald-50 text-slate-700 hover:text-slate-900 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-600 group-hover:bg-emerald-600/20 transition-colors">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold">Cargar Ausencia</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Registrar licencia de docente</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                </Link>

                <Link
                  href="/employees/create"
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500/40 hover:bg-emerald-50 text-slate-700 hover:text-slate-900 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-700/10 text-emerald-700 group-hover:bg-emerald-700/20 transition-colors">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold">Nuevo Docente</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Registrar personal en la planta</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                </Link>
              </>
            )}

            <Link
              href="/reports"
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-500/40 hover:bg-purple-50 text-slate-700 hover:text-slate-900 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 group-hover:bg-purple-500/20 transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold">Generar Reporte Mensual</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Exportar periodos a PDF/Excel</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-purple-600 transition-all" />
            </Link>
          </div>

          <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl">
            <h4 className="text-xs font-bold text-slate-800">Nota de Rol</h4>
            <p className="text-[11px] text-slate-700 mt-1.5 leading-relaxed">
              Estás conectado con el rol de <span className="font-semibold text-emerald-700 capitalize">{session.role}</span>. 
              {session.role === 'admin' 
                ? ' Tienes permisos completos para registrar y modificar docentes y ausencias.'
                : ' Tu nivel de acceso es de solo lectura. Puedes consultar tableros y descargar reportes.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
