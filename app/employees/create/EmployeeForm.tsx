'use client';

import { useActionState } from 'react';
import { createEmployee } from '../actions';
import Link from 'next/link';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

interface Department {
  id: string;
  name: string;
}

interface EmployeeFormProps {
  departments: Department[];
}

export default function EmployeeForm({ departments }: EmployeeFormProps) {
  const [state, formAction, isPending] = useActionState(createEmployee, null);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/employees"
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Registrar Nuevo Empleado</h1>
          <p className="text-slate-400 text-xs mt-0.5">Ingresa los datos personales y laborales</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block" htmlFor="first_name">
                Nombre(s) <span className="text-red-500">*</span>
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                placeholder="Ej. María Laura"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs outline-none transition-all"
              />
            </div>

            {/* Apellido */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block" htmlFor="last_name">
                Apellido(s) <span className="text-red-500">*</span>
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                placeholder="Ej. González"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs outline-none transition-all"
              />
            </div>

            {/* Legajo */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block" htmlFor="file_number">
                Número de Legajo / Ficha <span className="text-red-500">*</span>
              </label>
              <input
                id="file_number"
                name="file_number"
                type="text"
                required
                placeholder="Ej. LEG-1020"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs outline-none transition-all font-mono"
              />
            </div>

            {/* Departamento */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block" htmlFor="department_id">
                Departamento / Área <span className="text-red-500">*</span>
              </label>
              <select
                id="department_id"
                name="department_id"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs outline-none transition-all"
              >
                <option value="">Selecciona un área...</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block" htmlFor="email">
                Correo Electrónico (Opcional)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="nombre.apellido@colegio.edu.ar"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs outline-none transition-all"
              />
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
              className="flex-1 text-center py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-850 text-slate-300 hover:text-white font-semibold text-xs transition-all"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-75"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Empleado</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
