'use client';

import { useActionState } from 'react';
import { updateEmployee } from '../../actions';
import Link from 'next/link';
import { Loader2, ArrowLeft, Save, ShieldAlert } from 'lucide-react';

interface Department {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  file_number: string;
  department_id: string;
  is_active: boolean;
}

interface EditFormProps {
  employee: Employee;
  departments: Department[];
}

export default function EditForm({ employee, departments }: EditFormProps) {
  // Enlazar el ID del empleado para que se pase automáticamente en la acción de servidor
  const updateAction = updateEmployee.bind(null, employee.id);
  const initialState = { error: '' };
  const [state, formAction, isPending] = useActionState(updateAction, initialState);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/employees"
          className="p-2 rounded-lg bg-green-800 text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-black">Modificar Docente</h1>
          <p className="text-slate-400 text-xs mt-0.5">Edita los datos personales o cambia el estado</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-gray-100 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-800 block" htmlFor="first_name">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                defaultValue={employee.first_name}
                required
                className="w-full bg-gray-50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-800 px-4 py-2.5 rounded-xl text-xs outline-none transition-all"
              />
            </div>

            {/* Apellido */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-800 block" htmlFor="last_name">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                defaultValue={employee.last_name}
                required
                className="w-full bg-gray-50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-800 px-4 py-2.5 rounded-xl text-xs outline-none transition-all"
              />
            </div>

            {/* Legajo */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-800 block" htmlFor="file_number">
                Número de Legajo<span className="text-red-500">*</span>
              </label>
              <input
                id="file_number"
                name="file_number"
                type="text"
                defaultValue={employee.file_number}
                required
                className="w-full bg-gray-50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-800 px-4 py-2.5 rounded-xl text-xs outline-none transition-all font-mono"
              />
            </div>

            {/* Departamento */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-800 block" htmlFor="department_id">
                Área <span className="text-red-500">*</span>
              </label>
              <select
                id="department_id"
                name="department_id"
                defaultValue={employee.department_id}
                required
                className="w-full bg-gray-50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-800 px-4 py-2.5 rounded-xl text-xs outline-none transition-all"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-800 block" htmlFor="email">
                Correo Electrónico (Opcional)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={employee.email || ''}
                placeholder="nombre.apellido@colegio.edu.ar"
                className="w-full bg-gray-50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-800 px-4 py-2.5 rounded-xl text-xs outline-none transition-all"
              />
            </div>

            {/* Estado Activo / Inactivo */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-800 block">
                Estado del Docente
              </label>
              <div className="flex gap-6 mt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="is_active"
                    value="true"
                    defaultChecked={employee.is_active === true}
                    className="accent-indigo-500 w-4 h-4 bg-slate-950 border-slate-800"
                  />
                  <span className="text-emerald-800 font-medium">Activo (habilitado para ausencias)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="is_active"
                    value="false"
                    defaultChecked={employee.is_active === false}
                    className="accent-indigo-500 w-4 h-4 bg-slate-950 border-slate-800"
                  />
                  <span className="text-slate-800 font-medium">Inactivo (no docente en funciones)</span>
                </label>
              </div>
            </div>
          </div>

          {state?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-center font-medium">
              {state.error}
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-slate-800/80">
            <Link
              href="/employees"
              className="flex-1 text-center py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-850 text-slate-800 hover:text-white font-semibold text-xs transition-all"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-700 hover:to-emerald-500 text-white font-semibold text-xs transition-all disabled:opacity-75"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
