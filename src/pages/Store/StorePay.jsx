import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStoreData } from '@/layouts/StoreLayout';
import carritoService from '@/services/carritoService';
import authService from '@/services/auth';
import apiClient from '@/services/apiClient';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';

const StorePay = () => {
  const store = useStoreData();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [cart, setCart] = useState(() => carritoService.obtenerCarrito(slug));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [direccion, setDireccion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    
    const loadCart = () => {
      const cartData = carritoService.obtenerCarrito(slug);
      setCart(cartData);

      if (cartData.items.length === 0) {
        navigate(`/tienda/${slug}/carrito`);
      }
    };

    loadCart();
    const unsubscribe = carritoService.suscribirACambios(loadCart);
    return () => unsubscribe();
  }, [slug, navigate]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (direccion.trim() === '') {
      setError('Por favor, ingresa una dirección de envío.');
      return;
    }

    if (!isAuthenticated || cart.items.length === 0) {
      setError('Tu carrito está vacío o no has iniciado sesión.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const payload = {
      tienda_id: store.id,
      direccion_entrega: direccion,
      items: cart.items.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad
      }))
    };

    try {
      const response = await apiClient.post('/ventas/pagos/crear-sesion-checkout/', payload);
      
      if (response && response.url) {
        window.location.href = response.url;
      } else {
        throw new Error("No se recibió la URL de pago.");
      }
  
    } catch (err) {
      console.error("Error al crear la sesión de Stripe:", err);

      const errorMessage = err.response?.data?.error || err.message || 'No se pudo procesar el pago. Intenta de nuevo.';
      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  if (cart.items.length === 0) {
    return null; 
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          to={`/tienda/${slug}/carrito`}
          className="inline-flex items-center text-orange-600 hover:text-orange-800 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Carrito
        </Link>
        <h1 className="text-3xl font-bold mt-2">Finalizar Compra</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Dirección de Envío</h2>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                Dirección, Ciudad y Referencias
              </label>
              <textarea
                id="direccion"
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ej: Av. Busch, Calle 1 Nro 123, Edificio Sol, Apto 2B (entre 2do y 3er anillo)."
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={isProcessing || !isAuthenticated}
              className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium text-lg flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirigiendo a Stripe...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Pagar Bs. {(cart.totalFinal || 0).toFixed(2)}
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center">
              Serás redirigido a Stripe para un pago seguro.
            </p>
          </form>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4 border-b pb-3">Resumen del Pedido</h2>
            <div className="space-y-2 mb-4">
              {cart.items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium text-gray-800">{item.nombre}</span>
                    <span className="text-gray-500"> x {item.cantidad}</span>
                  </div>
                  <span className="text-gray-700">Bs. {(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">Bs. {(cart.totalPrecio || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                {(cart.costoEnvio || 0) > 0 ? (
                  <span className="font-medium">Bs. {(cart.costoEnvio || 0).toFixed(2)}</span>
                ) : (
                  <span className="font-medium text-green-600">Gratis</span>
                )}
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-gray-900 font-bold text-lg">
                  <span>Total a Pagar</span>
                  <span>Bs. {(cart.totalFinal || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StorePay;