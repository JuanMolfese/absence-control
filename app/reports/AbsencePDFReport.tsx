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

// Estilos premium para el PDF con estética Light
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#334155', // slate-700
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#10b981', // emerald-500
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 32,
    height: 32,
    backgroundColor: '#065f46', // emerald-800
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerTitle: {
    color: '#0f172a', // slate-900
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#64748b', // slate-500
    fontSize: 9,
    marginTop: 4,
  },
  headerInfo: {
    textAlign: 'right',
  },
  headerInfoText: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 2,
  },
  headerInfoValue: {
    color: '#0f172a',
    fontWeight: 'bold',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8fafc', // slate-50
    borderWidth: 1,
    borderColor: '#f1f5f9', // slate-100
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  summaryCardLabel: {
    fontSize: 7,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  distributionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  distributionItem: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  distributionLabel: {
    fontSize: 8,
    color: '#475569',
  },
  distributionValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  signatureSection: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  signatureBox: {
    alignItems: 'center',
    width: 180,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#94a3b8',
    width: '100%',
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#64748b',
  },
  table: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    paddingVertical: 10,
    alignItems: 'center',
  },
  tableCellHeader: {
    paddingHorizontal: 8,
    fontWeight: 'bold',
    color: '#475569',
    fontSize: 8,
    textTransform: 'uppercase',
  },
  tableCell: {
    paddingHorizontal: 8,
    color: '#334155',
    fontSize: 8,
  },
  colEmpleado: { width: '28%' },
  colDpto: { width: '18%' },
  colMotivo: { width: '22%' },
  colPeriodo: { width: '24%' },
  colDias: { width: '8%', textAlign: 'center' },
  
  empName: {
    fontWeight: 'bold',
    color: '#0f172a',
    fontSize: 9,
  },
  empLegajo: {
    fontSize: 7,
    color: '#94a3b8',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 6,
    fontWeight: 'bold',
    marginTop: 4,
  },
  badgePresented: {
    backgroundColor: '#ecfdf5',
    color: '#065f46',
  },
  badgePending: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
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
      month: 'long',
      year: 'numeric',
    });
  };

  // Calcular métricas
  const totalAusencias = data.length;
  const totalDias = data.reduce((acc, curr) => acc + curr.total_days, 0);
  const certificadosPendientes = data.filter(
    ab => ab.requires_certificate && !ab.certificate_attached
  ).length;

  // Docentes únicos afectados
  const docentesAfectados = new Set(data.map(ab => ab.file_number)).size;

  // Distribución por motivo
  const distribucionMotivos = data.reduce((acc, curr) => {
    acc[curr.absence_type_name] = (acc[curr.absence_type_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Document title={`Reporte de Ausencias - ${formatDate(new Date())}`}>
      <Page size="A4" style={styles.page}>
        {/* Cabecera Moderna */}
        <View style={styles.header}>
          <View>
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}><Text>15</Text></View>
              <Text style={styles.headerTitle}>Gestión de Ausencias</Text>
            </View>
            <Text style={styles.headerSubtitle}>Escuela Primaria N° 15 - Tres Arroyos</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerInfoText}>
              Periodo: <Text style={styles.headerInfoValue}>{formatDate(startDateStr)} - {formatDate(endDateStr)}</Text>
            </Text>
            <Text style={styles.headerInfoText}>
              Área: <Text style={styles.headerInfoValue}>{departmentName}</Text>
            </Text>
            <Text style={styles.headerInfoText}>
              Fecha Emisión: <Text style={styles.headerInfoValue}>{formatDate(new Date())}</Text>
            </Text>
          </View>
        </View>

        {/* Resumen Ejecutivo */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>Total Registros</Text>
            <Text style={styles.summaryCardValue}>{totalAusencias}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>Días Acumulados</Text>
            <Text style={styles.summaryCardValue}>{totalDias}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>Docentes Afectados</Text>
            <Text style={styles.summaryCardValue}>{docentesAfectados}</Text>
          </View>
          {certificadosPendientes > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Pendientes Certificado</Text>
              <Text style={[styles.summaryCardValue, { color: '#b91c1c' }]}>
                {certificadosPendientes}
              </Text>
            </View>
          )}
        </View>

        {/* Distribución por Motivo */}
        {totalAusencias > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Distribución por Motivo</Text>
            <View style={styles.distributionGrid}>
              {Object.entries(distribucionMotivos).map(([motivo, cantidad]) => (
                <View key={motivo} style={styles.distributionItem}>
                  <Text style={styles.distributionLabel}>{motivo}</Text>
                  <Text style={styles.distributionValue}>{cantidad} {cantidad === 1 ? 'caso' : 'casos'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Detalle de Tabla */}
        <Text style={styles.sectionTitle}>Detalle de Inasistencias</Text>
        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <Text style={[styles.tableCellHeader, styles.colEmpleado]}>Docente</Text>
            <Text style={[styles.tableCellHeader, styles.colDpto]}>Área</Text>
            <Text style={[styles.tableCellHeader, styles.colMotivo]}>Motivo</Text>
            <Text style={[styles.tableCellHeader, styles.colPeriodo]}>Periodo</Text>
            <Text style={[styles.tableCellHeader, styles.colDias]}>Días</Text>
          </View>

          {data.map((item, index) => (
            <View key={item.id} style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa' }]}>
              <View style={[styles.tableCell, styles.colEmpleado]}>
                <Text style={styles.empName}>{item.last_name}, {item.first_name}</Text>
                <Text style={styles.empLegajo}>Legajo: {item.file_number}</Text>
              </View>
              <Text style={[styles.tableCell, styles.colDpto]}>{item.department_name}</Text>
              <View style={[styles.tableCell, styles.colMotivo]}>
                <Text>{item.absence_type_name}</Text>
                {item.requires_certificate && (
                  <View style={[styles.badge, item.certificate_attached ? styles.badgePresented : styles.badgePending]}>
                    <Text>{item.certificate_attached ? 'CERTIFICADO PRESENTADO' : 'CERTIFICADO PENDIENTE'}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tableCell, styles.colPeriodo]}>
                {formatDate(item.start_date)} al {formatDate(item.end_date)}
              </Text>
              <Text style={[styles.tableCell, styles.colDias, { fontWeight: 'bold' }]}>{item.total_days}</Text>
            </View>
          ))}
        </View>

        {/* Espacio para Firmas */}
        <View style={styles.signatureSection} wrap={false}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Firma del Docente</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Sello y Firma Autoridad</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Documento oficial de control de asistencia - EP N° 15</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
