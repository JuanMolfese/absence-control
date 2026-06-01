'use client';

import { useActionState, useState, useEffect, startTransition } from 'react';
import { updateAbsence, deleteAbsence } from '../../actions';
import Link from 'next/link';
import { Loader2, ArrowLeft, Save, AlertCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

interface Absence {
  id: string;
  employee_id: string;
  absence_type_id: number;
  start_date: Date | string;
  end_date: Date | string;
  reason: string | null;
  certificate_attached: boolean;
}

interface EditAbsenceFormProps {
  absence: Absence;
  employees: Employee[];
  absenceTypes: AbsenceType[];
}

export default function EditAbsenceForm({ absence, employees, absenceTypes }: EditAbsenceFormProps) {
  const router = useRouter();
  const updateAction = updateAbsence.bind(null, absence.id);
  const initialState = { error: '' };
  const [state, formAction, isPending] = useActionState(updateAction, initialState);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(absence.absence_type_id);
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

  // Formatear fecha para el input type="date" (YYYY-MM-DD)
  const formatDateForInput = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro de ausencia? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAbsence(absence.id);
      router.push('/absences');
      router.refresh();
    } catch (error) {
      alert('Error al intentar eliminar la ausencia.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/absences"
            className="p-2 rounded-lg bg-green-800 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-black">Modificar Ausencia</h1>
            <p className="text-slate-400 text-xs mt-0.5">Edita la licencia o inasistencia del docente</p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={isDeleting || isPending}
          className="flex items-center justify-center p-2.5 rounded-xl border border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
          title="Eliminar Ausencia"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin text-red-400" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-gray-100 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Empleado */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-800 block" htmlFor="employee_id">
                Docente <span className="text-red-500">*</span>
              </label>
              <select
                id="employee_id"
                name="employee_id"
                required
                defaultValue={absence.employee_id}
                className="w-full bg-gray-50 border border-slate-800 focus:border-green-600 focus:ring-1 focus: ring-green-800 text-gray-800 px-4 py-2.5 rounded-xl text-xs outline-none transition-all"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.last_name}, {emp.first_name} ({emp.file_number})
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Ausencia */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-800 block" htmlFor="absence_type_id">
                Motivo de Ausencia <span className="text-red-500">*</span>
              </label>
              <select
                id="absence_type_id"
                name="absence_type_id"
                required
                defaultValue={absence.absence_type_id}
                onChange={(e) => setSelectedTypeId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full bg-gray-50 border border-slate-800 focus:border-green-600 focus:ring-1 focus: ring-green-800 text-gray-800 px-4 py-2.5 rounded-xl text-xs outline-none transition-all"
              >
                {absenceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} {type.requires_certificate ? '(Requiere Certificado)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha de Inicio */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-800 block" htmlFor="start_date">
                Fecha de Inicio <span className="text-red-500">*</span>
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                required
                defaultValue={formatDateForInput(absence.start_date)}
                className="w-full bg-gray-50 border border-slate-800 focus:border-green-600 focus:ring-1 focus: ring-green-800 text-gray-800 px-4 py-2.5 rounded-xl text-xs outline-none transition-all"
              />
            </div>

            {/* Fecha de Fin */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-800 block" htmlFor="end_date">
                Fecha de Fin <span className="text-red-500">*</span>
              </label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                required
                defaultValue={formatDateForInput(absence.end_date)}
                className="w-full bg-gray-50 border border-slate-800 focus:border-green-600 focus:ring-1 focus: ring-green-800 text-gray-800 px-4 py-2.5 rounded-xl text-xs outline-none transition-all"
              />
            </div>

            {/* Certificado (Mostrar solo si aplica) */}
            {requiresCert && (
              <div className="space-y-3 md:col-span-2 p-4 bg-green-800 border border-slate-800 rounded-xl animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Justificación médica requerida</h4>
                    <p className="text-[10px] text-white mt-0.5">
                      Este tipo de licencia requiere la presentación física o digital de un certificado médico justificante.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-green-900/60">
                  <label className="text-xs font-semibold text-white block mb-1">
                    ¿El certificado ya fue presentado?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="certificate_attached"
                        value="true"
                        defaultChecked={absence.certificate_attached === true}
                        className="accent-indigo-500 w-4 h-4"
                      />
                      <span className="text-white font-medium">Sí, se adjuntó / presentó certificado</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="certificate_attached"
                        value="false"
                        defaultChecked={absence.certificate_attached === false}
                        className="accent-indigo-500 w-4 h-4"
                      />
                      <span className="text-white font-medium">No, queda pendiente de entrega</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Observaciones */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-800 block" htmlFor="reason">
                Observaciones / Detalles
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                defaultValue={absence.reason || ''}
                placeholder="Ingresa diagnósticos, observaciones u otros detalles de la ausencia..."
                className="w-full bg-gray-50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-800 px-4 py-2.5 rounded-xl text-xs outline-none transition-all resize-none"
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
              className="flex-1 text-center py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-850 text-slate-800 hover:text-white font-semibold text-xs transition-all"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={isPending || isDeleting}
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
