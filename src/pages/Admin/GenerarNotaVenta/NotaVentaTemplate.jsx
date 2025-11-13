import React from 'react';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

// --- ESTILOS EN LÍNEA ---
// Convertimos todos los Tailwind 'className' a 'style' para
// que html2canvas y jsPDF los lean sin errores (como "oklch").
const styles = {
  // Contenedor principal
  page: {
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: '11px', // text-xs
    fontFamily: 'Arial, sans-serif',
    width: '210mm',
    minHeight: '297mm', // Altura A4
    boxSizing: 'border-box',
    margin: '0 auto',
  },
  // Contenedor interno
  container: {
    maxWidth: '100%',
  },
  // SECCIÓN 1: CABECERA
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  halfWidth: {
    width: '50%',
    boxSizing: 'border-box',
  },
  empresaNombre: {
    fontWeight: 'bold',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
  },
  facturaDatos: {
    width: '50%',
    border: '1px solid black',
    padding: '0.5rem',
    boxSizing: 'border-box',
  },
  flex: {
    display: 'flex',
  },
  key: {
    width: '33.3333%',
    fontWeight: 'bold',
  },
  valueCuf: {
    wordBreak: 'break-all',
  },
  marginTop: {
    marginTop: '0.5rem',
  },
  
  // SECCIÓN 2: TÍTULO
  tituloContainer: {
    textAlign: 'center',
    margin: '1.5rem 0',
  },
  titulo: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    margin: 0,
  },

  // SECCIÓN 3: DATOS CLIENTE
  clienteContainer: {
    borderTop: '1px dashed black',
    borderBottom: '1px dashed black',
    padding: '0.5rem 0',
    marginBottom: '1rem',
  },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
  },

  // SECCIÓN 4: TABLA
  table: {
    width: '100%',
    borderCollapse: 'collapse', // Importante para que los bordes se fusionen
    border: '1px solid black',
    marginBottom: '1rem',
    fontSize: '10px',
  },
  th: {
    backgroundColor: '#f3f4f6',
    border: '1px solid black',
    padding: '0.25rem',
  },
  tdCenter: {
    padding: '0.25rem',
    border: '1px solid black',
    textAlign: 'center',
  },
  tdLeft: {
    padding: '0.25rem',
    border: '1px solid black',
    textAlign: 'left',
  },
  tdRight: {
    padding: '0.25rem',
    border: '1px solid black',
    textAlign: 'right',
  },
  // Estilo para las llaves de totales (TOTAL BS, IMPORTE...)
  tdTotalKey: {
    padding: '0.25rem',
    border: '1px solid black',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  // Estilo para la celda vacía (colSpan=3) en las filas de totales
  tdEmpty: {
     padding: '0.25rem',
     // Solo bordes laterales para que no se vea feo
     borderLeft: '1px solid black',
     borderRight: '1px solid black',
  },
  // Estilo para la celda "Son:..."
  tdLiteral: {
    padding: '0.25rem',
    border: '1px solid black',
    textAlign: 'left',
  },

  // SECCIÓN 6: PIE
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '9px',
  },
  footerBold: {
    fontWeight: 'bold',
    marginBottom: '0.25rem',
  }
};


const NotaVentaTemplate = React.forwardRef(({ venta }, ref) => {
  
  // --- Datos de la Empresa (Simulados como en tu plantilla) ---
  const empresa = {
    nombre: "ELECTROPLUS",
    direccion: "Calle Juan Pablo II #54",
    telefono: "+591 72901902",
    ciudad: "Santa Cruz de la Sierra",
    nit: "456489012",
    facturaNro: "100",
    cuf: "B2AFA11610013351564D658EE50D2D2A4AA6B65",
    actividad: "Venta de electrodomésticos y/o productos electrónicos",
  };

  // --- Datos del Cliente ---
  const cliente = {
    nombre: venta.cliente.nombre_completo,
    nit: venta.cliente.nit || "Sin Nit",
  };

  // --- Formateador de Fecha ---
  const formatFecha = (dateString) => {
    if (!dateString) return "N/A";
    const formatoDeDjango = "yyyy-MM-dd HH:mm:ss xx";
    try {
      const fecha = parse(dateString, formatoDeDjango, new Date());
      return format(fecha, "dd/MM/yyyy hh:mm a");
    } catch (e) { 
      console.error("Error formateando fecha:", e);
      return dateString; 
    }
  };
  
  // --- Formateador de Números ---
  const f = (num) => parseFloat(num).toFixed(2);

  // (Simulación de la función "Son: ... Bolivianos")
  const numeroALetras = (num) => {
    // Esta es una simulación MUY simple
    const entero = Math.floor(num);
    const decimal = Math.round((num - entero) * 100);
    return `Son: ${entero} ${decimal.toString().padStart(2, '0')}/100 Bolivianos`;
  };

  return (
    // Adjuntamos el ref al div principal
    <div ref={ref} style={styles.page}>
      <div style={styles.container}>
        
        {/* === SECCIÓN 1: CABECERA === */}
        <header style={styles.header}>
          {/* Datos de la Empresa */}
          <div style={styles.halfWidth}>
            <h2 style={styles.empresaNombre}>{empresa.nombre}</h2>
            <p>{empresa.direccion}</p>
            <p>Teléfono: {empresa.telefono}</p>
            <p>{empresa.ciudad}</p>
          </div>
          
          {/* Datos de la Factura (NIT, CUF, etc.) */}
          <div style={styles.facturaDatos}>
            <div style={styles.flex}>
              <strong style={styles.key}>NIT:</strong>
              <span>{empresa.nit}</span>
            </div>
            <div style={styles.flex}>
              <strong style={styles.key}>FACTURA N°:</strong>
              <span>{empresa.facturaNro}</span>
            </div>
            <div style={styles.flex}>
              <strong style={styles.key}>CUF:</strong>
              <span style={styles.valueCuf}>{empresa.cuf}</span>
            </div>
            <div style={{...styles.flex, ...styles.marginTop}}>
              <strong style={styles.key}>ACTIVIDAD:</strong>
              <span>{empresa.actividad}</span>
            </div>
          </div>
        </header>

        {/* === SECCIÓN 2: TÍTULO === */}
        <div style={styles.tituloContainer}>
          <h1 style={styles.titulo}>FACTURA</h1>
          <p>(Con Derecho a Crédito Fiscal)</p>
        </div>

        {/* === SECCIÓN 3: DATOS DEL CLIENTE === */}
        <div style={styles.clienteContainer}>
          <div style={styles.flexBetween}>
            <div>
              <strong>Fecha:</strong> {formatFecha(venta.fecha_venta)}
            </div>
            <div>
              <strong>NIT/CI/CEX:</strong> {cliente.nit}
            </div>
          </div>
          <div>
            <strong>Nombre/Razón Social:</strong> {cliente.nombre}
          </div>
        </div>

        {/* === SECCIÓN 4: TABLA DE ITEMS Y TOTALES === */}
        <table style={styles.table}>
          <thead>
            <tr style={styles.th}>
              <th style={styles.th}>CÓDIGO</th>
              <th style={styles.th}>CANTIDAD</th>
              <th style={{...styles.th, textAlign: 'left'}}>DESCRIPCIÓN</th>
              <th style={styles.th}>PRECIO UNITARIO</th>
              <th style={styles.th}>DESCUENTO</th>
              <th style={styles.th}>SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            {venta.items.map(item => (
              <tr key={item.id}>
                <td style={styles.tdCenter}>{item.producto.codigo_referencia || 'N/A'}</td>
                <td style={styles.tdCenter}>{item.cantidad}</td>
                <td style={styles.tdLeft}>{item.producto.nombre}</td>
                <td style={styles.tdRight}>{f(item.precio_historico)}</td>
                <td style={styles.tdRight}>{f(0.00)}</td>
                <td style={styles.tdRight}>{f(item.subtotal)}</td>
              </tr>
            ))}
            
            {/* --- INICIO SECCIÓN TOTALES (MOVIDO) --- */}
            {/* Esta es la fila que se alinea con el diseño de Impuestos */}
            <tr>
              {/* Celda para "Son:..." */}
              <td style={styles.tdLiteral} colSpan="3">
                {numeroALetras(venta.total)}
              </td>
              {/* Colspan 2 para abarcar "Precio Unitario" y "Descuento" */}
              <td style={styles.tdTotalKey} colSpan="2">TOTAL BS</td>
              <td style={styles.tdRight}>{f(venta.total)}</td>
            </tr>
            <tr>
              {/* Celda vacía que ocupa el espacio de "Son:..." */}
              <td style={styles.tdEmpty} colSpan="3"></td>
              <td style={styles.tdTotalKey} colSpan="2">IMPORTE BASE CRÉDITO FISCAL</td>
              <td style={styles.tdRight}>{f(venta.total)}</td>
            </tr>
            {/* --- FIN SECCIÓN TOTALES --- */}

          </tbody>
        </table>

        {/* === SECCIÓN 6: PIE DE PÁGINA === */}
        <footer style={styles.footer}>
          <p style={styles.footerBold}>
            "ESTA FACTURA CONTRIBUYE AL DESARROLLO DE NUESTRO PAÍS, EL USO ILÍCITO DE ÉSTA SERÁ SANCIONADO DE ACUERDO A LEY"
          </p>
          <p>Ley N° 453: Tienes derecho a recibir información sobre las características y contenidos de los servicios que utilices.</p>
        </footer>

      </div>
    </div>
  );
});

export default NotaVentaTemplate;