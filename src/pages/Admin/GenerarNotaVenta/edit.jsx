import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  Loader,
  Save,
  Printer,
  FileText,
  Download,
  Calendar,
  User,
  CreditCard,
  Package,
  DollarSign,
  ShoppingCart,
  Building
} from "lucide-react";
import apiClient from "@/services/apiClient";
import { toast } from "react-hot-toast";
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import NotaVentaTemplate from './NotaVentaTemplate';

const getStatusType = (status) => {
  switch (status) {
    case 'ENTREGADO':
    case 'COMPLETADO':
    case 'PROCESADA':
      return 'active';

    case 'ENVIADA':
    case 'EN_PREPARACION':
    case 'EN_CAMINO':
    case 'PENDIENTE':
      return 'warning';

    case 'CANCELADA':
    case 'FALLIDO':
    case 'REEMBOLSADO':
    case 'INCIDENCIA':
      return 'inactive';

    default:
      return 'neutral';
  }
};

const OPCIONES_ESTADO_VENTA = [
  { value: 'PROCESADA', label: 'Procesada' },
  { value: 'ENVIADA', label: 'Enviada' },
  { value: 'ENTREGADA', label: 'Entregada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

const OPCIONES_ESTADO_PAGO = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'COMPLETADO', label: 'Completado' },
  { value: 'FALLIDO', label: 'Fallido' },
  { value: 'REEMBOLSADO', label: 'Reembolsado' },
];

const OPCIONES_ESTADO_ENVIO = [
  { value: 'EN_PREPARACION', label: 'En preparación' },
  { value: 'EN_CAMINO', label: 'En camino' },
  { value: 'ENTREGADO', label: 'Entregado' },
  { value: 'INCIDENCIA', label: 'Incidencia' },
];

const SelectField = ({ label, value, onChange, options, disabled = false, icon: Icon }) => (
  <div className="flex-1">
    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 transition-all duration-200 hover:border-gray-400"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const InfoCard = ({ icon: Icon, title, value, subtitle, className = "" }) => (
  <div className={`bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-lg font-semibold text-gray-900 truncate">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const StatusBadge = ({ estado }) => {
  const statusType = getStatusType(estado);

  const getStatusConfig = () => {
    switch (statusType) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = () => {
    const allOptions = [...OPCIONES_ESTADO_VENTA, ...OPCIONES_ESTADO_PAGO, ...OPCIONES_ESTADO_ENVIO];
    const option = allOptions.find(opt => opt.value === estado);
    return option ? option.label : estado;
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusConfig()}`}>
      {getStatusLabel()}
    </span>
  );
};

const EditarVenta = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [ventaEstado, setVentaEstado] = useState("");
  const [pagoEstado, setPagoEstado] = useState("");
  const [envioEstado, setEnvioEstado] = useState("");

  const componentRef = useRef();

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/ventas/admin-ventas/${id}/`)
      .then(response => {
        const data = response;
        setVenta(data);
        setVentaEstado(data.estado);
        setPagoEstado(data.pagos?.[0]?.estado || "PENDIENTE");
        setEnvioEstado(data.envio?.estado || "EN_PREPARACION");
        setError("");
      })
      .catch((e) => setError("Error al cargar datos: " + (e.detail || e.message)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError("");

    const payload = {
      estado: ventaEstado,
      pago_estado: pagoEstado,
      envio_estado: envioEstado,
    };

    try {
      await apiClient.patch(`/ventas/admin-ventas/${id}/`, payload);
      toast.success("¡Estados actualizados correctamente!");
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data ? JSON.stringify(e.response.data) : e.message;
      setError("Error al guardar: " + errorMsg);
      toast.error("Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    toast.loading('Preparando impresión...', { id: 'print-toast' });

    if (!componentRef.current) {
      toast.error('Error: No se encuentra la plantilla.', { id: 'print-toast' });
      return;
    }

    const printContainer = document.createElement('div');
    printContainer.style.position = 'fixed';
    printContainer.style.left = '0';
    printContainer.style.top = '0';
    printContainer.style.width = '100%';
    printContainer.style.height = '100%';
    printContainer.style.backgroundColor = 'white';
    printContainer.style.zIndex = '9999';
    printContainer.style.overflow = 'auto';
    printContainer.style.visibility = 'hidden';

    const contentClone = componentRef.current.cloneNode(true);

    if (contentClone.firstChild) {
      const templateElement = contentClone.firstChild;
      templateElement.style.width = '100%';
      templateElement.style.minHeight = 'auto';
      templateElement.style.padding = '20px';
      templateElement.style.margin = '0';
      templateElement.style.border = 'none';
      templateElement.style.boxShadow = 'none';
      templateElement.style.boxSizing = 'border-box';
    }

    printContainer.appendChild(contentClone);
    document.body.appendChild(printContainer);

    const style = document.createElement('style');
    style.innerHTML = `
        @media print {
          body > *:not(.print-container) {
            display: none !important;
            visibility: hidden !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-container {
            visibility: visible !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            background-color: white;
          }
          .print-container > div {
             width: 100% !important;
             min-height: auto !important;
             padding: 0 !important;
             margin: 0 !important;
             box-shadow: none !important;
          }
          table, div, header, footer {
            page-break-inside: avoid;
          }
        }
    `;
    printContainer.appendChild(style);
    printContainer.className = 'print-container';

    setTimeout(() => {
      window.print();

      setTimeout(() => {
        document.body.removeChild(printContainer);
        toast.success('Impresión completada', { id: 'print-toast' });
      }, 100);
    }, 500);
  };

  const handleExportPDF = async () => {
    toast.loading('Generando PDF...', { id: 'pdf-toast' });
    
    const elementToCapture = componentRef.current;

    if (!elementToCapture) {
      toast.error('Error: No se encuentra la plantilla.', { id: 'pdf-toast' });
      return;
    }

    try {
      const canvas = await html2canvas(elementToCapture, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        width: elementToCapture.offsetWidth,
        height: elementToCapture.offsetHeight,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      
      const imgWidth = pdfWidth; 
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      const nombreClienteLimpio = venta.cliente.nombre_completo.replace(/\s+/g, '_');
      const nombreArchivo = `NotaVenta_${venta.id}_${nombreClienteLimpio}.pdf`;
      
      pdf.save(nombreArchivo);

      toast.success('PDF generado exitosamente', { id: 'pdf-toast' });

    } catch (err) {
      console.error("Error al generar PDF:", err);
      toast.error('Error al generar PDF: ' + err.message, { id: 'pdf-toast' });
    }
  };

  const handleExportHTML = () => {
    toast.loading('Generando HTML...', { id: 'html-toast' });

    if (!componentRef.current) {
      toast.error('Error: No se encuentra la plantilla.', { id: 'html-toast' });
      return;
    }

    const content = componentRef.current.innerHTML;
    const newWindow = window.open('', '_blank');

    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Factura ${venta?.id || 'Nro'}</title>
            <meta charset="UTF-8">
            <style>
              body { 
                background-color: #f9fafb; 
                font-family: Arial, sans-serif;
                padding: 20px;
                margin: 0;
              }
              .print-container {
                background-color: white;
                padding: 20px;
                max-width: 210mm;
                margin: 0 auto;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
              @media print {
                body { 
                  background-color: white; 
                  padding: 0;
                }
                .print-container {
                  box-shadow: none;
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${content}
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
      newWindow.focus();

      toast.success('HTML generado', { id: 'html-toast' });
    } else {
      toast.error('Error al abrir la nueva pestaña. Revisa los permisos de pop-ups.', { id: 'html-toast' });
    }
  };

  const formatVentaDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    const formatoDeDjango = "yyyy-MM-dd HH:mm:ss xx";
    try {
      const fechaParseada = parse(dateString, formatoDeDjango, new Date());
      return format(fechaParseada, "dd MMMM yyyy, HH:mm 'hs'", { locale: es });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando información de la venta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-6 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-8 h-8" />
            <h3 className="text-xl font-bold">Error</h3>
          </div>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            <ArrowLeft size={20} /> Volver atrás
          </button>
        </div>
      </div>
    );
  }

  if (!venta) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard/ventas/nota-venta")}
              className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors font-medium"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Nota de Venta <span className="text-blue-600">#{venta.id}</span>
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatVentaDate(venta.fecha_venta)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge estado={ventaEstado} />
            <StatusBadge estado={pagoEstado} />
            <StatusBadge estado={envioEstado} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard
            icon={User}
            title="Cliente"
            value={venta.cliente.nombre_completo}
            subtitle={venta.cliente.email}
          />
          <InfoCard
            icon={DollarSign}
            title="Total"
            value={`Bs. ${venta.total}`}
            subtitle="Monto total de la venta"
          />
          <InfoCard
            icon={ShoppingCart}
            title="Items"
            value={venta.items.length}
            subtitle="Productos en la venta"
          />
          <InfoCard
            icon={Building}
            title="Vendedor"
            value={venta.vendedor || 'N/A'}
            subtitle="Responsable de la venta"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Save className="w-5 h-5" />
                Gestión de Estados
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <SelectField
                  label="Estado de Venta"
                  value={ventaEstado}
                  onChange={(e) => setVentaEstado(e.target.value)}
                  options={OPCIONES_ESTADO_VENTA}
                  disabled={saving}
                  icon={ShoppingCart}
                />
                <SelectField
                  label="Estado del Pago"
                  value={pagoEstado}
                  onChange={(e) => setPagoEstado(e.target.value)}
                  options={OPCIONES_ESTADO_PAGO}
                  disabled={saving || !venta.pagos?.length}
                  icon={CreditCard}
                />
                <SelectField
                  label="Estado del Envío"
                  value={envioEstado}
                  onChange={(e) => setEnvioEstado(e.target.value)}
                  options={OPCIONES_ESTADO_ENVIO}
                  disabled={saving || !venta.envio}
                  icon={Package}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 rounded-t-2xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5" />
                Exportar Documento
              </h2>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-center">
              <button
                onClick={handlePrint}
                className="w-full px-4 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 font-medium flex items-center justify-center gap-3 group"
              >
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Printer className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-semibold">Imprimir Documento</span>
              </button>

              <button
                onClick={handleExportHTML}
                className="w-full px-4 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 font-medium flex items-center justify-center gap-3 group"
              >
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-semibold">Vista HTML</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="w-full px-4 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all duration-200 font-medium flex items-center justify-center gap-3 group"
              >
                <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                  <Download className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-semibold">Exportar PDF</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detalles Completos de la Venta
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información del Cliente</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre completo:</span>
                    <span className="font-medium">{venta.cliente.nombre_completo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{venta.cliente.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">NIT:</span>
                    <span className="font-medium">{venta.cliente.nit || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Razón Social:</span>
                    <span className="font-medium text-right">{venta.cliente.razon_social || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información de la Venta</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendedor:</span>
                    <span className="font-medium">{venta.vendedor || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-medium">{formatVentaDate(venta.fecha_venta)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-lg text-green-600">Bs. {venta.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Items Comprados</h3>
              <div className="space-y-3">
                {venta.items.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.producto.nombre}</p>
                        <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">Bs. {item.precio_historico}</p>
                      <p className="text-sm text-gray-600">Subtotal: Bs. {item.subtotal}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: '-9999px', top: '0', backgroundColor: 'white' }}>
        <div ref={componentRef}>
          {venta && <NotaVentaTemplate venta={venta} />}
        </div>
      </div>

    </div>
  );
};

export default EditarVenta;