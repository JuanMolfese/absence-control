import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Plus, Search, Filter, Edit, Mail, Award, CheckCircle2, XCircle, Users } from 'lucide-react';
import Link from 'next/link';

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dept?: string }>;
}) {
  const session = await getSession();
  if (!session) return null;

  const resolvedParams = await searchParams;
  const q = resolvedParams.q || '';
  const deptFilter = resolvedParams.dept || '';

  // 1. Obtener lista de departamentos para el filtro
  const departments = await sql`
    SELECT id, name FROM departments ORDER BY name
  `;

  // 2. Obtener la lista de empleados filtrada
  const employees = await sql`
    SELECT e.*, d.name as department_name
    FROM employees e
    JOIN departments d ON e.department_id = d.id
    WHERE 
      (e.first_name ILIKE ${'%' + q + '%'} 
       OR e.last_name ILIKE ${'%' + q + '%'} 
       OR e.file_number ILIKE ${'%' + q + '%'})
      ${deptFilter ? sql`AND e.department_id = ${deptFilter}` : sql``}
    ORDER BY e.is_active DESC, e.last_name ASC, e.first_name ASC
  `;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Gestión de Empleados / Docentes</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Listado y administración de todo el personal registrado
          </p>
        </div>
        {session.role === 'admin' && (
          <Link
            href="/employees/create"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all duration-200 shadow-md shadow-indigo-600/10"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Empleado / Docente</span>
          </Link>
        )}
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4">
        <form method="GET" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Input de Búsqueda */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nombre, apellido o legajo..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white pl-9 pr-4 py-2 rounded-xl text-xs outline-none transition-all"
            />
          </div>

          {/* Filtro de Departamento */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Filter className="w-4 h-4" />
            </span>
            <select
              name="dept"
              defaultValue={deptFilter}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white pl-9 pr-4 py-2 rounded-xl text-xs outline-none transition-all appearance-none"
            >
              <option value="">Todos los Departamentos</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white py-2 px-4 rounded-xl text-xs font-semibold border border-slate-750 transition-all"
            >
              Aplicar Filtros
            </button>
            {(q || deptFilter) && (
              <Link
                href="/employees"
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center transition-all"
              >
                Limpiar
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden">
        {employees.length === 0 ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
            <Users className="w-12 h-12 text-slate-700 mb-3" />
            <p className="text-sm font-semibold">No se encontraron empleados</p>
            <p className="text-xs text-slate-600 mt-1">Prueba a cambiar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/85 text-slate-400 font-semibold uppercase bg-slate-950/30">
                  <th className="py-4 px-6">Legajo / N° Ficha</th>
                  <th className="py-4 px-6">Apellido y Nombre</th>
                  <th className="py-4 px-6">Departamento / Área</th>
                  <th className="py-4 px-6">Contacto</th>
                  <th className="py-4 px-6 text-center">Estado</th>
                  {session.role === 'admin' && <th className="py-4 px-6 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-850/20 transition-colors group">
                    {/* Legajo */}
                    <td className="py-4 px-6 font-mono font-medium text-slate-400 group-hover:text-indigo-400 transition-colors">
                      {emp.file_number}
                    </td>
                    {/* Nombre */}
                    <td className="py-4 px-6 font-semibold text-white">
                      {emp.last_name}, {emp.first_name}
                    </td>
                    {/* Departamento */}
                    <td className="py-4 px-6 text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-slate-500" />
                        {emp.department_name}
                      </span>
                    </td>
                    {/* Contacto */}
                    <td className="py-4 px-6">
                      {emp.email ? (
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          {emp.email}
                        </span>
                      ) : (
                        <span className="text-slate-650 italic">Sin correo registrado</span>
                      )}
                    </td>
                    {/* Estado */}
                    <td className="py-4 px-6 text-center">
                      {emp.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 font-medium">
                          <XCircle className="w-3 h-3" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    {/* Acciones */}
                    {session.role === 'admin' && (
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/employees/edit/${emp.id}`}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all"
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
