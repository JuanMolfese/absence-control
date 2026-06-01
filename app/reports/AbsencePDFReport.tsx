import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

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

interface AbsencePDFReportProps {
  data: AbsenceReportItem[];
  startDateStr: string;
  endDateStr: string;
  departmentName: string;
  employeeName: string;
}

// Estilos premium para el PDF (colores en gama azul/slate)
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1e293b', // slate-800
    backgroundColor: '#ffffff',
  },
  headerBanner: {
    backgroundColor: '#0f172a', // slate-900
    padding: 15,
    borderRadius: 6,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#94a3b8', // slate-400
    fontSize: 8,
    marginTop: 2,
  },
  headerMeta: {
    color: '#ffffff',
    fontSize: 8,
    textAlign: 'right',
  },
  metaValue: {
    fontWeight: 'bold',
    color: '#166534', // emerald-800
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 4,
    marginBottom: 10,
    marginTop: 10,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8fafc', // slate-50
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
  },
  summaryCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065f46', // emerald-800 darker
  },
  summaryCardLabel: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9', // slate-100
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableCellHeader: {
    padding: 6,
    fontWeight: 'bold',
    color: '#334155',
  },
  tableCell: {
    padding: 6,
    color: '#475569',
  },
  colEmpleado: { width: '25%' },
  colDpto: { width: '20%' },
  colMotivo: { width: '22%' },
  colPeriodo: { width: '23%' },
  colDias: { width: '10%', textAlign: 'center' },
  
  empName: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  empLegajo: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 1,
  },
  certBadgePending: {
    color: '#dc2626', // red-600
    fontSize: 7,
    fontWeight: 'bold',
  },
  certBadgePresented: {
    color: '#16a34a', // green-600
    fontSize: 7,
    fontWeight: 'bold',
  },
  certBadgeNA: {
    color: '#64748b',
    fontSize: 7,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#94a3b8',
  }
});

export default function AbsencePDFReport({ 
  data, 
  startDateStr, 
  endDateStr, 
  departmentName, 
  employeeName 
}: AbsencePDFReportProps) {
  // Formatear fechas
  const formatDate = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    const userTimezoneOffset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() + userTimezoneOffset);
    return localDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calcular métricas
  const totalAusencias = data.length;
  const totalDias = data.reduce((acc, curr) => acc + curr.total_days, 0);
  const certificadosPendientes = data.filter(
    ab => ab.requires_certificate && !ab.certificate_attached
  ).length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Banner de Cabecera */}
        <View style={styles.headerBanner}>
          <View>
            <Text style={styles.headerTitle}>Reporte de Ausentismo</Text>
            <Text style={styles.headerSubtitle}>Generado por el Sistema de Control de Ausencias de E.P. n° 15 de Tres Arroyos</Text>
          </View>
          <View>
            <Text style={styles.headerMeta}>
              Periodo: <Text style={styles.metaValue}>{formatDate(startDateStr)}</Text> al <Text style={styles.metaValue}>{formatDate(endDateStr)}</Text>
            </Text>
            <Text style={[styles.headerMeta, { marginTop: 4 }]}>
              Filtro Área: <Text style={styles.metaValue}>{departmentName}</Text>
            </Text>
          </View>
        </View>

        {/* Tarjetas de Resumen */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardValue}>{totalAusencias}</Text>
            <Text style={styles.summaryCardLabel}>Total Registros</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardValue}>{totalDias}</Text>
            <Text style={styles.summaryCardLabel}>Días Acumulados</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryCardValue, { color: certificadosPendientes > 0 ? '#dc2626' : '#16a34a' }]}>
              {certificadosPendientes}
            </Text>
            <Text style={styles.summaryCardLabel}>Pendientes Certif.</Text>
          </View>
        </View>

        {/* Listado de Registros */}
        <Text style={styles.sectionTitle}>Detalle de Inasistencias</Text>
        <View style={styles.table}>
          {/* Header de la Tabla */}
          <View style={styles.tableRowHeader}>
            <Text style={[styles.tableCellHeader, styles.colEmpleado]}>Docente</Text>
            <Text style={[styles.tableCellHeader, styles.colDpto]}>Departamento</Text>
            <Text style={[styles.tableCellHeader, styles.colMotivo]}>Motivo de Ausencia</Text>
            <Text style={[styles.tableCellHeader, styles.colPeriodo]}>Periodo</Text>
            <Text style={[styles.tableCellHeader, styles.colDias]}>Días</Text>
          </View>

          {/* Filas */}
          {data.length === 0 ? (
            <View style={{ padding: 15, alignItems: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 8 }}>No se encontraron registros en el periodo seleccionado.</Text>
            </View>
          ) : (
            data.map((ab, i) => (
              <View key={ab.id || i} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.colEmpleado]}>
                  <Text style={styles.empName}>{ab.last_name}, {ab.first_name}</Text>
                  <Text style={styles.empLegajo}>{ab.file_number}</Text>
                </View>
                <Text style={[styles.tableCell, styles.colDpto]}>{ab.department_name}</Text>
                <View style={[styles.tableCell, styles.colMotivo]}>
                  <Text>{ab.absence_type_name}</Text>
                  {!ab.requires_certificate ? (
                    <Text style={styles.certBadgeNA}>Certificado: N/A</Text>
                  ) : ab.certificate_attached ? (
                    <Text style={styles.certBadgePresented}>Certificado: Entregado</Text>
                  ) : (
                    <Text style={styles.certBadgePending}>Certificado: PENDIENTE</Text>
                  )}
                </View>
                <Text style={[styles.tableCell, styles.colPeriodo]}>
                  {formatDate(ab.start_date)} al {formatDate(ab.end_date)}
                </Text>
                <Text style={[styles.tableCell, styles.colDias]}>{ab.total_days}</Text>
              </View>
            ))
          )}
        </View>

        {/* Footer con Paginación */}
        <View style={styles.footer} fixed>
          <Text>Confidencial - Reporte Interno de Asistencia</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
