'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import dynamic from 'next/dynamic';
import AbsencePDFReport from './AbsencePDFReport';

// Importación dinámica de PDFDownloadLink para evitar errores de compilación SSR en Next.js
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

interface AbsenceReportItem {
  id: string;
  start_date: string | Date;
  end_date: string | Date;
  reason: string | null;
  certificate_attached: boolean;
  requires_certificate: boolean;
  first_name: string;
  last_name: string;
  file_number: string;
  department_name: string;
  absence_type_name: string;
  total_days: number;
}

interface ReportsClientProps {
  data: AbsenceReportItem[];
  startDateStr: string;
  endDateStr: string;
  departmentName: string;
  employeeName: string;
}

export default function ReportsClient({
  data,
  startDateStr,
  endDateStr,
  departmentName,
  employeeName,
}: ReportsClientProps) {
  const [isClient, setIsClient] = useState(false);

  // Asegurar que estamos en el cliente antes de renderizar los descargadores
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleExportExcel = () => {
    // Formatear columnas para la hoja de cálculo
    const formattedData = data.map((ab, idx) => ({
      'N°': idx + 1,
      'Legajo': ab.file_number,
      'Apellido': ab.last_name,
      'Nombre': ab.first_name,
      'Departamento / Área': ab.department_name,
      'Tipo de Ausencia': ab.absence_type_name,
      'Fecha Inicio': new Date(ab.start_date).toLocaleDateString('es-ES'),
      'Fecha Fin': new Date(ab.end_date).toLocaleDateString('es-ES'),
      'Total Días': ab.total_days,
      'Certificado Médico': !ab.requires_certificate 
        ? 'No Requiere' 
        : ab.certificate_attached 
          ? 'Presentado' 
          : 'Pendiente',
      'Observaciones / Diagnóstico': ab.reason || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    
    // Auto-ajustar el ancho de las columnas
    const maxLens = formattedData.reduce((acc, row) => {
      Object.keys(row).forEach((key) => {
        const val = row[key as keyof typeof row]?.toString() || '';
        acc[key] = Math.max(acc[key] || 10, val.length + 2);
      });
      return acc;
    }, {} as Record<string, number>);

    worksheet['!cols'] = Object.keys(maxLens).map(key => ({
      wch: maxLens[key]
    }));

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial de Ausencias');

    // Nombre del archivo indicando filtros aplicados
    const areaNameClean = departmentName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Reporte_Ausencias_${areaNameClean}_${startDateStr}_al_${endDateStr}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
  };

  const getPdfFileName = () => {
    const areaNameClean = departmentName.replace(/[^a-zA-Z0-9]/g, '_');
    return `Reporte_Ausencias_${areaNameClean}_${startDateStr}_al_${endDateStr}.pdf`;
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Botón Excel */}
      <button
        onClick={handleExportExcel}
        disabled={data.length === 0}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md shadow-emerald-700/10 transition-all"
      >
        <FileSpreadsheet className="w-4 h-4" />
        <span>Exportar a Excel (.xlsx)</span>
      </button>

      {/* Botón PDF (Importado Dinámicamente) */}
      {isClient && data.length > 0 && (
        <PDFDownloadLink
          document={
            <AbsencePDFReport
              data={data}
              startDateStr={startDateStr}
              endDateStr={endDateStr}
              departmentName={departmentName}
              employeeName={employeeName}
            />
          }
          fileName={getPdfFileName()}
        >
          {/* @ts-ignore */}
          {({ loading }) => (
            <button
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md shadow-indigo-700/10 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>{loading ? 'Generando PDF...' : 'Exportar a PDF (.pdf)'}</span>
            </button>
          )}
        </PDFDownloadLink>
      )}

      {isClient && data.length === 0 && (
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-500 cursor-not-allowed text-white text-xs font-semibold transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>Exportar a PDF (.pdf)</span>
        </button>
      )}
    </div>
  );
}
