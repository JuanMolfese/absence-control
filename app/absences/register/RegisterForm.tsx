'use client';

import { useActionState, useState, useEffect } from 'react';
import { registerAbsence } from '../actions';
import Link from 'next/link';
import { Loader2, ArrowLeft, Save, AlertCircle } from 'lucide-react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  file_number: string;
}

interface AbsenceType {
  id: number;
  name: string;
  requires_certificate: boolean;
}

interface RegisterFormProps {
  employees: Employee[];
  absenceTypes: AbsenceType[];
}

export default function RegisterForm({ employees, absenceTypes }: RegisterFormProps) {
  const [state, formAction, isPending] = useActionState(registerAbsence, null);
  
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [requiresCert, setRequiresCert] = useState(false);

  // Monitorear si el tipo de ausencia requiere certificado
  useEffect(() => {
    if (selectedTypeId === null) {
      setRequiresCert(false);
      return;
    }
    const selected = absenceTypes.find(t => t.id === selectedTypeId);
    setRequiresCert(selected ? selected.requires_certificate : false);
  }, [selectedTypeId, absenceTypes]);

  // Obtener fecha actual en formato YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/absences"
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Registrar Ausencia</h1>
          <p className="text-slate-400 text-xs mt-0.5">Ingresa una nueva licencia o inasistencia del personal</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Empleado */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block" htmlFor="employee_id">
                Empleado / Docente <span className="text-red-500">*</span>
              </label>
              <select
                id="employee_id"
                name="employee_id"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs outline-none transition-all"
              >
                <option value="">Selecciona al personal ausente...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.last_name}, {emp.first_name} ({emp.file_number})
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Ausencia */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block" htmlFor="absence_type_id">
                Motivo de Ausencia <span className="text-red-500">*</span>
              </label>
              <select
                id="absence_type_id"
                name="absence_type_id"
                required
                onChange={(e) => setSelectedTypeId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs outline-none transition-all"
              >
                <option value="">Selecciona el motivo...</option>
                {absenceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} {type.requires_certificate ? '(Requiere Certificado)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha de Inicio */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block" htmlFor="start_date">
                Fecha de Inicio <span className="text-red-500">*</span>
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                required
                defaultValue={getTodayString()}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs outline-none transition-all"
              />
            </div>

            {/* Fecha de Fin */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block" htmlFor="end_date">
                Fecha de Fin <span className="text-red-500">*</span>
              </label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                required
                defaultValue={getTodayString()}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs outline-none transition-all"
              />
            </div>

            {/* Certificado (Mostrar solo si aplica) */}
            {requiresCert && (
              <div className="space-y-3 md:col-span-2 p-4 bg-slate-950/80 border border-slate-800 rounded-xl animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Justificación médica requerida</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Este tipo de licencia requiere la presentación física o digital de un certificado médico justificante.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900/60">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    ¿El certificado ya fue presentado?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="certificate_attached"
                        value="true"
                        className="accent-indigo-500 w-4 h-4"
                      />
                      <span className="text-emerald-400 font-medium">Sí, se adjuntó / presentó certificado</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="certificate_attached"
                        value="false"
                        defaultChecked
                        className="accent-indigo-500 w-4 h-4"
                      />
                      <span className="text-slate-400 font-medium">No, queda pendiente de entrega</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Observaciones */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block" htmlFor="reason">
                Observaciones / Detalles
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                placeholder="Ingresa diagnósticos, número de consulta, u otros detalles relevantes de la ausencia..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs outline-none transition-all resize-none"
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
              href="/absences"
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
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Registrar Ausencia</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
