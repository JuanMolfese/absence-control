import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ReportsClient from './ReportsClient';
/* import { FileSpreadsheet, FileText, Calendar, Filter, Users, ShieldAlert } from 'lucide-react'; */
import Link from 'next/link';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start_date?: string; end_date?: string; dept?: string; emp?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;

  // Fechas por defecto: del 1 de este mes al día de hoy
  const now = new Date();
  const defaultStartDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const defaultEndDate = now.toISOString().split('T')[0];

  const startDateStr = resolvedParams.start_date || defaultStartDate;
  const endDateStr = resolvedParams.end_date || defaultEndDate;
  const deptFilter = resolvedParams.dept || '';
  const empFilter = resolvedParams.emp || '';

  // 1. Obtener filtros para los select
  const departments = await sql`
    SELECT id, name FROM departments ORDER BY name
  `;

  const employees = await sql`
    SELECT id, first_name, last_name, file_number 
    FROM employees 
    ORDER BY last_name, first_name
  `;

  // 2. Obtener nombres de filtros activos para las cabeceras de reportes
  let selectedDeptName = 'Todos los Departamentos';
  if (deptFilter) {
    const deptInfo = departments.find(d => d.id === deptFilter);
    if (deptInfo) selectedDeptName = deptInfo.name;
  }

  let selectedEmpName = 'Todos los Docentes';
  if (empFilter) {
    const empInfo = employees.find(e => e.id === empFilter);
    if (empInfo) selectedEmpName = `${empInfo.last_name}, ${empInfo.first_name}`;
  }

  // 3. Ejecutar consulta de ausencias en el periodo y con filtros seleccionados
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
      a.start_date >= ${startDateStr}
      AND a.end_date <= ${endDateStr}
      ${deptFilter ? sql`AND e.department_id = ${deptFilter}` : sql``}
      ${empFilter ? sql`AND a.employee_id = ${empFilter}` : sql``}
    ORDER BY a.start_date ASC
  `;

  // Formatear fecha para la visualización en la tabla
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

  // Calcular métricas
  const totalAusencias = absences.length;
  const totalDias = absences.reduce((acc, curr) => acc + curr.total_days, 0);
  const certificadosPendientes = absences.filter(
    ab => ab.requires_certificate && !ab.certificate_attached
  ).length;

  // Convertir los datos a tipos serializables para pasárselos al componente cliente
  const serializableAbsences = absences.map(ab => ({
    id: ab.id,
    start_date: ab.start_date.toISOString().split('T')[0],
    end_date: ab.end_date.toISOString().split('T')[0],
    reason: ab.reason,
    certificate_attached: ab.certificate_attached,
    requires_certificate: ab.requires_certificate,
    first_name: ab.first_name,
    last_name: ab.last_name,
    file_number: ab.file_number,
    department_name: ab.department_name,
    absence_type_name: ab.absence_type_name,
    total_days: ab.total_days,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Centro de Reportes y Descargas</h1>
        <p className="text-slate-600 text-xs mt-0.5">
          Filtra periodos y genera exportaciones de inasistencias en Excel y PDF
        </p>
      </div>

      {/* Panel de Filtros */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <form method="GET" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Fecha Inicio */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Fecha Desde</label>
            <input
              type="date"
              title="Filtrar por fecha de inicio del periodo de ausencia"
              name="start_date"
              defaultValue={startDateStr}
              required
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-700 text-slate-900 px-3 py-2 rounded-xl text-xs outline-none transition-all"
            />
          </div>

          {/* Fecha Fin */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Fecha Hasta</label>
            <input
              type="date"
              title="Filtrar por fecha de fin del periodo de ausencia"
              name="end_date"
              defaultValue={endDateStr}
              required
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-700 text-slate-900 px-3 py-2 rounded-xl text-xs outline-none transition-all"
            />
          </div>

          {/* Departamento */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Departamento / Área</label>
            <select
              name="dept"
              title="Filtrar por Departamento / Área"
              defaultValue={deptFilter}
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-700 text-slate-900 px-3 py-2 rounded-xl text-xs outline-none transition-all"
            >
              <option value="">Todos los Departamentos</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Empleado */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Empleado / Docente</label>
            <select
              name="emp"
              title="Filtrar por Docente"
              defaultValue={empFilter}
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-700 text-slate-900 px-3 py-2 rounded-xl text-xs outline-none transition-all"
            >
              <option value="">Todos los Docentes</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.last_name}, {e.first_name} ({e.file_number})</option>
              ))}
            </select>
          </div>

          {/* Botones de acción */}
          <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-200">
            {(resolvedParams.start_date || resolvedParams.end_date || resolvedParams.dept || resolvedParams.emp) && (
              <Link
                href="/reports"
                className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 hover:text-slate-900 py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center transition-all"
              >
                Valores por Defecto
              </Link>
            )}
            <button
              type="submit"
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 py-2 px-5 rounded-xl text-xs font-semibold border border-slate-300 transition-all shadow-sm"
            >
              Generar Reporte
            </button>
          </div>
        </form>
      </div>

      {/* Grid de Resumen del Reporte Filtrado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
          <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Total Ausencias</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalAusencias}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
          <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Días Acumulados</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{totalDias}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
          <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Certificados Pendientes</span>
          <p className={`text-2xl font-bold mt-1 ${certificadosPendientes > 0 ? 'text-red-600 animate-pulse' : 'text-emerald-700'}`}>
            {certificadosPendientes}
          </p>
        </div>
      </div>

      {/* Acciones de Descarga y Vista Previa */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-md font-bold text-slate-900">Exportaciones Disponibles</h3>
            <p className="text-slate-600 text-xs mt-0.5">Descarga el reporte en tu formato de preferencia</p>
          </div>
          
          <ReportsClient
            data={serializableAbsences}
            startDateStr={startDateStr}
            endDateStr={endDateStr}
            departmentName={selectedDeptName}
            employeeName={selectedEmpName}
          />
        </div>

        {/* Vista previa de los datos a descargar */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 mb-4">Vista Previa del Reporte</h4>
          
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            {absences.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p className="text-xs text-slate-700">No hay datos de ausencias para el rango y filtros seleccionados.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                    <th className="py-3 px-4">Legajo</th>
                    <th className="py-3 px-4">Docente</th>
                    <th className="py-3 px-4">Departamento</th>
                    <th className="py-3 px-4">Motivo</th>
                    <th className="py-3 px-4">Periodo</th>
                    <th className="py-3 px-4 text-center">Días</th>
                    <th className="py-3 px-4 text-center">Certificado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {absences.map((ab, i) => (
                    <tr key={ab.id || i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">{ab.file_number}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{ab.last_name}, {ab.first_name}</td>
                      <td className="py-3 px-4 text-slate-600">{ab.department_name}</td>
                      <td className="py-3 px-4 text-slate-700">{ab.absence_type_name}</td>
                      <td className="py-3 px-4 text-slate-700">
                        {formatDate(ab.start_date)} al {formatDate(ab.end_date)}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">{ab.total_days}</td>
                      <td className="py-3 px-4 text-center">
                        {!ab.requires_certificate ? (
                          <span className="text-[9px] text-slate-600 bg-slate-200 px-2 py-0.5 rounded border border-slate-300">N/A</span>
                        ) : ab.certificate_attached ? (
                          <span className="text-[9px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">Entregado</span>
                        ) : (
                          <span className="text-[9px] text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200 font-medium">Pendiente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
