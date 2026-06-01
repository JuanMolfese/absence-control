import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Plus, Search, Filter, Calendar, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default async function AbsencesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dept?: string; type?: string; cert?: string }>;
}) {
  const session = await getSession();
  if (!session) return null;

  const resolvedParams = await searchParams;
  const q = resolvedParams.q || '';
  const deptFilter = resolvedParams.dept || '';
  const typeFilter = resolvedParams.type || '';
  const certFilter = resolvedParams.cert || '';

  // 1. Obtener filtros para los select
  const departments = await sql`SELECT id, name FROM departments ORDER BY name`;
  const absenceTypes = await sql`SELECT id, name FROM absence_types ORDER BY name`;

  // 2. Query de ausencias
  const absences = await sql`
    SELECT 
      a.id,
      a.start_date,
      a.end_date,
      a.reason,
      a.certificate_attached,
      e.first_name,
      e.last_name,
      e.file_number,
      d.name as department_name,
      t.name as absence_type_name,
      t.requires_certificate,
      (a.end_date - a.start_date + 1)::int as total_days
    FROM absences a
    JOIN employees e ON a.employee_id = e.id
    JOIN departments d ON e.department_id = d.id
    JOIN absence_types t ON a.absence_type_id = t.id
    WHERE 
      (e.first_name ILIKE ${'%' + q + '%'} 
       OR e.last_name ILIKE ${'%' + q + '%'} 
       OR e.file_number ILIKE ${'%' + q + '%'})
      ${deptFilter ? sql`AND e.department_id = ${deptFilter}` : sql``}
      ${typeFilter ? sql`AND a.absence_type_id = ${parseInt(typeFilter)}` : sql``}
      ${
        certFilter === 'yes' 
          ? sql`AND a.certificate_attached = true` 
          : certFilter === 'no' 
            ? sql`AND a.certificate_attached = false AND t.requires_certificate = true` 
            : sql``
      }
    ORDER BY a.start_date DESC
  `;

  const formatDate = (dateString: string | Date) => {
    const d = new Date(dateString);
    const userTimezoneOffset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() + userTimezoneOffset);
    return localDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gestión de Inasistencias</h1>
          <p className="text-slate-600 text-xs mt-0.5">
            Registro, control y seguimiento de las inasistencias cargadas en el sistema
          </p>
        </div>
        {session.role === 'admin' && (
          <Link
            href="/absences/register"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-700 hover:to-emerald-500 text-white font-semibold text-xs transition-all duration-200 shadow-md shadow-emerald-600/10"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Ausencia</span>
          </Link>
        )}
      </div>

      {/* Filtros avanzados */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <form method="GET" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Buscar Empleado */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Docente</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Nombre, apellido o legajo..."
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-700 text-slate-900 pl-9 pr-4 py-2 rounded-xl text-xs outline-none transition-all"
              />
            </div>
          </div>

          {/* Departamento */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Departamento</label>
            <select
              name="dept"
              defaultValue={deptFilter}
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-700 text-slate-900 px-3 py-2 rounded-xl text-xs outline-none transition-all"
            >
              <option value="">Todos los Departamentos</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Tipo de Ausencia */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Tipo de Ausencia</label>
            <select
              name="type"
              defaultValue={typeFilter}
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-700 text-slate-900 px-3 py-2 rounded-xl text-xs outline-none transition-all"
            >
              <option value="">Todos los Motivos</option>
              {absenceTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Certificado médico */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Certificado Médico</label>
            <select
              name="cert"
              defaultValue={certFilter}
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-700 text-slate-900 px-3 py-2 rounded-xl text-xs outline-none transition-all"
            >
              <option value="">Todos los Estados</option>
              <option value="yes">Presentado / Justificado</option>
              <option value="no">Pendiente de Presentar</option>
            </select>
          </div>

          {/* Acciones de filtro */}
          <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-200">
            {(q || deptFilter || typeFilter || certFilter) && (
              <Link
                href="/absences"
                className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 hover:text-slate-900 py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center transition-all"
              >
                Limpiar Filtros
              </Link>
            )}
            <button
              type="submit"
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 py-2 px-5 rounded-xl text-xs font-semibold border border-slate-300 transition-all shadow-sm"
            >
              Buscar Ausencias
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de Ausencias */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {absences.length === 0 ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
            <Calendar className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">No se encontraron registros de ausencias</p>
            <p className="text-xs text-slate-600 mt-1">Intenta ajustando los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-semibold uppercase bg-slate-50">
                  <th className="py-4 px-6">Docente</th>
                  <th className="py-4 px-6">Dpto / Área</th>
                  <th className="py-4 px-6">Tipo / Motivo</th>
                  <th className="py-4 px-6">Periodo</th>
                  <th className="py-4 px-6 text-center">Días</th>
                  <th className="py-4 px-6 text-center">Certificado</th>
                  {session.role === 'admin' && <th className="py-4 px-6 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {absences.map((ab) => (
                  <tr key={ab.id} className="hover:bg-slate-50/50 transition-colors group">
                    {/* Empleado */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {ab.last_name}, {ab.first_name}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{ab.file_number}</div>
                    </td>
                    {/* Departamento */}
                    <td className="py-4 px-6 text-slate-600">{ab.department_name}</td>
                    {/* Motivo */}
                    <td className="py-4 px-6">
                      <div>
                        <span className="font-medium text-slate-800">{ab.absence_type_name}</span>
                        {ab.reason && (
                          <p className="text-[10px] text-slate-600 mt-1 truncate max-w-xs" title={ab.reason}>
                            "{ab.reason}"
                          </p>
                        )}
                      </div>
                    </td>
                    {/* Periodo */}
                    <td className="py-4 px-6 font-medium">
                      <span>{formatDate(ab.start_date)}</span>
                      {ab.start_date.toString() !== ab.end_date.toString() && (
                        <>
                          <span className="text-slate-400 mx-1">al</span>
                          <span>{formatDate(ab.end_date)}</span>
                        </>
                      )}
                    </td>
                    {/* Total Días */}
                    <td className="py-4 px-6 text-center font-bold text-slate-800">
                      {ab.total_days}
                    </td>
                    {/* Certificado */}
                    <td className="py-4 px-6 text-center">
                      {!ab.requires_certificate ? (
                        <span className="text-[10px] text-slate-600 bg-slate-200 px-2 py-0.5 rounded border border-slate-300 font-medium">No Requiere</span>
                      ) : ab.certificate_attached ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Entregado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-200 font-medium">
                          <XCircle className="w-3 h-3" />
                          Pendiente
                        </span>
                      )}
                    </td>
                    {/* Acciones */}
                    {session.role === 'admin' && (
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/absences/edit/${ab.id}`}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-600 hover:text-emerald-700 hover:border-emerald-300/50 hover:bg-emerald-50 transition-all"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
