import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/services/apiClient';
import { format } from 'date-fns';
import { FaFilePdf, FaFileExcel, FaPrint, FaSearch, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TODAS_LAS_COLUMNAS = [
  { key: 'id', header: 'ID' },
  { key: 'nombre', header: 'Nombre' },
  { key: 'codigo_referencia', header: 'SKU/Ref.' },
  { key: 'precio', header: 'Precio (Bs.)' },
  { key: 'stock', header: 'Stock' },
  { key: 'estado', header: 'Estado' },
  { key: 'marca', header: 'Marca' },
  { key: 'categorias', header: 'Categorías' },
  { key: 'tienda', header: 'Tienda' },
  { key: 'descripcion', header: 'Descripción' },
];

const COLUMNAS_DEFAULT = [
    'nombre', 
    'codigo_referencia', 
    'precio', 
    'stock', 
    'estado', 
    'marca',
    'categorias'
];

const ESTADOS_PRODUCTO_OPCIONES = [
    { value: 'true', label: 'Activo' },
    { value: 'false', label: 'Inactivo' },
];

const ReporteProductos = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null, page: 1, totalPages: 1 });
  
  const [filtros, setFiltros] = useState({
    precioMin: '',
    precioMax: '',
    search: '',
    estado: '',
    marca: '',
    categoria: ''
  });

  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [columnasVisibles, setColumnasVisibles] = useState(new Set(COLUMNAS_DEFAULT));
  const [exportLimit, setExportLimit] = useState(100);
  
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [marcasRes, categoriasRes] = await Promise.all([
          apiClient.get('/comercial/marcas/?page_size=1000&estado=true'),
          apiClient.get('/comercial/categorias/?page_size=1000&estado=true')
        ]);
        setMarcas(marcasRes.results || []);
        setCategorias(categoriasRes.results || []);
      } catch (err) {
        console.error("Error cargando filtros (marcas/categorías):", err);
        setError("No se pudieron cargar las opciones de filtro (marcas/categorías).");
      }
    };
    fetchFilterOptions();
  }, []);

  const fetchDatos = useCallback(async (url = null, limit = 10) => {
    setLoading(true);
    setError(null);

    let endpoint;
    let params = new URLSearchParams();

    if (url) {
      try {
        const fullUrl = new URL(url);
        endpoint = fullUrl.pathname + fullUrl.search;
      } catch (e) {
        endpoint = url;
      }
    } else {
      params.append('page_size', limit);
      
      const currentPage = pagination.page || 1;
      if (currentPage > 1) params.append('page', currentPage);
      
      if (filtros.search) params.append('search', filtros.search);
      
      if (filtros.precioMin) params.append('precio__gte', filtros.precioMin);
      if (filtros.precioMax) params.append('precio__lte', filtros.precioMax);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.marca) params.append('marca', filtros.marca);
      if (filtros.categoria) params.append('categorias', filtros.categoria);
      
      params.append('ordering', 'nombre');
      
      endpoint = `/comercial/productos/?${params.toString()}`;
    }

    try {
      const response = await apiClient.get(endpoint); 
      
      const results = response.results || [];
      const count = response.count || 0;
      
      setDatos(results); 
      
      setPagination({
        count: count,
        next: response.next || null,
        previous: response.previous || null,
        page: url ? (new URLSearchParams(new URL(url, window.location.origin).search).get('page') || 1) : 1,
        totalPages: Math.ceil(count / limit) || 1
      });

    } catch (err) {
      let errorMsg = 'Error al cargar los datos. ';
      if (err.response) {
        errorMsg += `Status: ${err.response.status}. Detalle: ${JSON.stringify(err.response.data)}`;
      } else if (err.request) {
        errorMsg += 'No se pudo conectar al servidor. Revisa tu conexión y la URL del API.';
      } else {
        errorMsg += err.message;
      }
      setError(errorMsg);
      setDatos([]);
    } finally {
      setLoading(false);
    }
  }, [filtros, pagination.page]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 })); 
    fetchDatos(null); 
  }, [filtros]); 

  const handleFiltrar = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDatos(null);
  };

  const handleFiltroNumero = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFiltros(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const irAPagina = (url) => {
    if (url) {
      const nextPage = new URLSearchParams(new URL(url, window.location.origin).search).get('page') || 1;
      setPagination(prev => ({ ...prev, page: Number(nextPage) }));
      fetchDatos(url);
    }
  };

  const getDatosParaExportar = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('page_size', exportLimit); 
    
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.precioMin) params.append('precio__gte', filtros.precioMin);
    if (filtros.precioMax) params.append('precio__lte', filtros.precioMax);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.marca) params.append('marca', filtros.marca);
    if (filtros.categoria) params.append('categorias', filtros.categoria);
    params.append('ordering', 'nombre');
    
    try {
      const response = await apiClient.get(`/comercial/productos/?${params.toString()}`);
      return response.results || []; 
      
    } catch (err) {
      setError('Error al preparar la exportación: ' + (err.response?.data?.detail || err.message));
      return [];
    } finally {
      setLoading(false);
    }
  };

  const prepararDatosExport = (datosRaw) => {
    const headers = TODAS_LAS_COLUMNAS
      .filter(col => columnasVisibles.has(col.key))
      .map(col => col.header);
      
    const body = datosRaw.map(dato => {
      return TODAS_LAS_COLUMNAS
        .filter(col => columnasVisibles.has(col.key))
        .map(col => renderCellContent(dato, col.key, true));
    });
    
    return { headers, body };
  };

  const handleExportExcel = async () => {
    const datosRaw = await getDatosParaExportar();
    if (!datosRaw || datosRaw.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }
    
    const { headers, body } = prepararDatosExport(datosRaw);
    
    const ws = XLSX.utils.aoa_to_sheet([headers, ...body]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");
    XLSX.writeFile(wb, `Reporte_Productos_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const handleExportPDF = async () => {
    const datosRaw = await getDatosParaExportar();
    if (!datosRaw || datosRaw.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }
    
    const { headers, body } = prepararDatosExport(datosRaw);

    const doc = new jsPDF({ orientation: 'landscape' }); 
    doc.text("Reporte de Productos", 14, 16);
    
    autoTable(doc, {
      head: [headers],
      body: body,
      startY: 20,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 }, 
      headStyles: { fillColor: [22, 160, 133] }
    });

    doc.save(`Reporte_Productos_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };
  
  const handlePrint = async () => {
    const datosRaw = await getDatosParaExportar();
    if (!datosRaw || datosRaw.length === 0) {
      alert("No hay datos para imprimir.");
      return;
    }
    const { headers, body } = prepararDatosExport(datosRaw);

    const htmlHeader = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    const htmlBody = body.map(row => `<tr>${row.map(cell => `<td>${String(cell)}</td>`).join('')}</tr>`).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Productos</title> 
        <style>
          body { font-family: sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 9px; } 
          th, td { border: 1px solid #ddd; padding: 5px; text-align: left; word-break: break-all; }
          th { background-color: #f4f4f4; font-weight: bold; }
          h1 { font-size: 20px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <h1>Reporte de Productos</h1> 
        <p>Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
        <table>
          <thead>${htmlHeader}</thead>
          <tbody>${htmlBody}</tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
      };
    } else {
      alert("Por favor, habilite las ventanas emergentes para imprimir el reporte.");
    }
  };

  const handleToggleColumna = (key) => {
    const nuevasColumnas = new Set(columnasVisibles);
    if (nuevasColumnas.has(key)) {
      nuevasColumnas.delete(key);
    } else {
      nuevasColumnas.add(key);
    }
    setColumnasVisibles(nuevasColumnas);
  };

  const renderCellContent = (dato, key, paraExportar = false) => {
    const na = paraExportar ? "N/A" : <span className="italic text-gray-500">N/A</span>;
    const blank = paraExportar ? "" : <span className="italic text-gray-500">-</span>;

    switch (key) {
      case 'id':
        return dato.id;
      case 'nombre':
        return dato.nombre || na;
      case 'codigo_referencia':
        return dato.codigo_referencia || blank;
      case 'precio':
        const precioNum = parseFloat(dato.precio);
        return isNaN(precioNum) ? (paraExportar ? '0.00' : '0.00') : precioNum.toFixed(2);
      case 'stock':
        return dato.stock;
      case 'estado':
        const estadoLabel = dato.estado ? 'Activo' : 'Inactivo';
        if (paraExportar) return estadoLabel;
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                dato.estado 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
                {estadoLabel}
            </span>
        );
      case 'marca':
        return dato.marca?.nombre || blank;
      case 'categorias':
        if (dato.categorias && dato.categorias.length > 0) {
            return dato.categorias.map(c => c.nombre).join(', ');
        }
        return blank;
      case 'tienda':
        return dato.tienda || na;
      case 'descripcion':
        if (paraExportar) {
            return dato.descripcion || '';
        }
        return (dato.descripcion || '').substring(0, 50) + (dato.descripcion && dato.descripcion.length > 50 ? '...' : '');
      default:
        const valor = dato[key];
        return valor || na;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-gray-50 min-h-screen">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 break-words">
          Reporte Dinámico: Productos
        </h1>
        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 w-full sm:w-auto"
        >
          <FaArrowLeft className="mr-2" />
          Volver
        </button>
      </div>

      <div className="p-4 sm:p-6 bg-white rounded-xl shadow-md mb-6 sm:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Búsqueda Rápida</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre, SKU, desc..."
                value={filtros.search}
                onChange={(e) => setFiltros(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
                value={filtros.estado}
                onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
                <option value="">Todos los Estados</option>
                {ESTADOS_PRODUCTO_OPCIONES.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <select
                value={filtros.marca}
                onChange={(e) => setFiltros(prev => ({ ...prev, marca: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
                <option value="">Todas las Marcas</option>
                {marcas.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
                value={filtros.categoria}
                onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
                <option value="">Todas las Categorías</option>
                {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Mínimo (Bs.)</label>
            <input
              type="number"
              name="precioMin"
              placeholder="Ej: 50"
              value={filtros.precioMin}
              onChange={handleFiltroNumero}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Máximo (Bs.)</label>
            <input
              type="number"
              name="precioMax"
              placeholder="Ej: 500"
              value={filtros.precioMax}
              onChange={handleFiltroNumero}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="mt-4 sm:mt-6 flex justify-end">
          <button
            onClick={handleFiltrar}
            disabled={loading}
            className="flex items-center justify-center px-4 sm:px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 w-full sm:w-auto"
          >
            {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaSearch className="mr-2" />}
            Aplicar Filtros
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 bg-white rounded-xl shadow-md mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-grow w-full lg:w-auto">
            <h4 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Columnas Visibles:</h4>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {TODAS_LAS_COLUMNAS.map(col => (
                <label key={col.key} className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={columnasVisibles.has(col.key)}
                    onChange={() => handleToggleColumna(col.key)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="break-words leading-tight">{col.header}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 w-full lg:w-auto">
            <div className="w-full sm:w-auto">
              <label htmlFor="exportLimit" className="block text-sm font-medium text-gray-700 mb-1">Límite filas</label>
              <select
                id="exportLimit"
                value={exportLimit}
                onChange={(e) => setExportLimit(Number(e.target.value))}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value={100}>100</option>
                <option value={500}>500</option>
                <option value={1000}>1,000</option>
                <option value={5000}>5,000</option>
              </select>
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-start sm:justify-end">
              <button onClick={handleExportExcel} className="p-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 flex-1 sm:flex-none" title="Exportar a Excel">
                <FaFileExcel size={18} className="mx-auto sm:mx-0" />
              </button>
              <button onClick={handleExportPDF} className="p-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 flex-1 sm:flex-none" title="Exportar a PDF">
                <FaFilePdf size={18} className="mx-auto sm:mx-0" />
              </button>
              <button onClick={handlePrint} className="p-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 flex-1 sm:flex-none" title="Imprimir (HTML)">
                <FaPrint size={18} className="mx-auto sm:mx-0" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-48 sm:h-64">
          <FaSpinner className="animate-spin text-blue-600 text-3xl sm:text-4xl" />
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow" role="alert">
          <p className="font-bold text-sm sm:text-base">Error</p>
          <p className="text-xs sm:text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {TODAS_LAS_COLUMNAS
                    .filter(col => columnasVisibles.has(col.key))
                    .map(col => (
                      <th key={col.key} scope="col" className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        {col.header}
                      </th>
                    ))
                  }
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {datos.map(dato => (
                  <tr key={dato.id} className="hover:bg-gray-50">
                    {TODAS_LAS_COLUMNAS
                      .filter(col => columnasVisibles.has(col.key))
                      .map(col => (
                        <td key={col.key} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 break-words max-w-xs sm:max-w-none">
                          {renderCellContent(dato, col.key)}
                        </td>
                      ))
                    }
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {datos.length === 0 && (
            <div className="text-center p-8 sm:p-12 text-gray-500 text-sm sm:text-base">
              No se encontraron registros con los filtros seleccionados.
            </div>
          )}
        </div>
      )}
      
      {!loading && !error && pagination.count > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 sm:mt-6">
          <span className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            Mostrando {datos.length} de {pagination.count} registros.
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => irAPagina(pagination.previous)}
              disabled={!pagination.previous}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => irAPagina(pagination.next)}
              disabled={!pagination.next}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporteProductos;