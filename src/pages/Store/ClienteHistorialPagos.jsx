import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/services/apiClient';
import { 
  ArrowLeftIcon, 
  ArrowPathIcon, 
  ShoppingBagIcon, 
  ChevronDownIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  MapPinIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

// Loading mejorado y elegante
const LoadingSpinner = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg font-medium">Cargando tu historial...</p>
    </div>
  </div>
);

// Función helper para formatear la fecha
const formatFecha = (fechaISO) => {
  return new Date(fechaISO).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Componente para el badge de estado
const EstadoBadge = ({ estado }) => {
  const getEstadoConfig = (estado) => {
    const configs = {
      'ENTREGADO': {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: <CheckCircleIcon className="w-4 h-4" />
      },
      'EN_CAMINO': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: <TruckIcon className="w-4 h-4" />
      },
      'PENDIENTE': {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: <ClockIcon className="w-4 h-4" />
      },
      'CANCELADO': {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: <XCircleIcon className="w-4 h-4" />
      }
    };
    
    return configs[estado] || configs.PENDIENTE;
  };

  const config = getEstadoConfig(estado);

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.icon}
      {estado.replace('_', ' ')}
    </motion.span>
  );
};

/**
 * Componente para una sola tarjeta de pedido (Acordeón)
 */
const PedidoCard = ({ venta, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const pago = venta.pagos.length > 0 ? venta.pagos[0] : null;
  const subtotal = venta.items.reduce((acc, item) => acc + parseFloat(item.subtotal), 0);
  const costoEnvio = parseFloat(venta.total) - subtotal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
    >
      {/* --- Cabecera Clicable --- */}
      <motion.button 
        className="w-full p-6 text-left flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.005 }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ShoppingBagIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-600">Pedido #{venta.id}</p>
              <p className="text-lg font-bold text-gray-800">{venta.tienda}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            {formatFecha(venta.fecha_venta)}
          </p>
        </div>
        
        <div className="flex-1 mt-4 md:mt-0 md:text-right">
          <div className="mb-2">
            <EstadoBadge estado={venta.envio.estado} />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            Bs. {parseFloat(venta.total).toFixed(2)}
          </p>
        </div>
        
        <ChevronDownIcon 
          className={`w-6 h-6 text-gray-400 md:ml-4 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-orange-600' : ''
          }`} 
        />
      </motion.button>

      {/* --- Cuerpo Colapsable --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 border-t bg-gray-50">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBagIcon className="w-5 h-5 text-orange-600" />
                Resumen del Pedido
              </h4>
              
              {/* Items */}
              <div className="space-y-3 mb-6">
                {venta.items.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.producto.nombre}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.cantidad} x Bs. {parseFloat(item.precio_historico).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-bold text-orange-600 text-lg">
                      Bs. {parseFloat(item.subtotal).toFixed(2)}
                    </p>
                  </motion.div>
                ))}
              </div>
              
              {/* Totales */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-800">Bs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Costo de Envío:</span>
                    <span className="font-medium text-gray-800">Bs. {costoEnvio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span className="text-gray-900">Total Pagado:</span>
                    <span className="text-orange-600">Bs. {parseFloat(venta.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Info de Envío y Pago */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-orange-600" />
                    Información de Envío
                  </h5>
                  <p className="text-sm text-gray-600 break-words mb-3">
                    {venta.envio.direccion_entrega}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Estado:</span>
                    <EstadoBadge estado={venta.envio.estado} />
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CreditCardIcon className="w-4 h-4 text-orange-600" />
                    Información de Pago
                  </h5>
                  <p className="text-sm text-gray-600 mb-2">Método: Tarjeta (Stripe)</p>
                  {pago && (
                    <>
                      <p className="text-sm text-gray-500 mb-2">
                        ID: <span className="font-mono text-xs break-all bg-gray-100 px-2 py-1 rounded">
                          {pago.stripe_payment_intent_id}
                        </span>
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Estado:</span>
                        <span className={`text-sm font-medium ${
                          pago.estado === 'COMPLETADO' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {pago.estado_display}
                        </span>
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Componente Principal de la Página
 */
const ClienteHistorialPagos = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get('/ventas/ventas/');
        setVentas(data.results || []);
        setError(null);
      } catch (err) {
        console.error("Error al cargar el historial de pagos:", err);
        setError("No se pudo cargar tu historial. Intenta más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
            >
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Historial de Pedidos</h1>
                <p className="text-gray-600 mt-1">Revisa todos tus pedidos realizados</p>
            </div>
            <Link
                to="/tiendas"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all border border-orange-600 shadow-sm hover:shadow-md"
            >
                <ArrowLeftIcon className="w-4 h-4" />
                Volver a Tiendas
            </Link>
        </motion.div>

        {/* Contenido Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {error ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
              <p className="text-red-600 font-medium text-lg">{error}</p>
            </div>
          ) : ventas.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
              <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                No tienes pedidos todavía
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Parece que aún no has realizado ninguna compra.
              </p>
              <Link
                to="/tiendas"
                className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-all font-semibold text-lg shadow-sm"
              >
                Explorar Tiendas
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <p className="text-gray-700 text-center">
                  Mostrando <span className="font-bold text-orange-600">{ventas.length}</span> pedido{ventas.length !== 1 ? 's' : ''}
                </p>
              </div>
              {ventas.map((venta, index) => (
                <PedidoCard key={venta.id} venta={venta} index={index} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ClienteHistorialPagos;