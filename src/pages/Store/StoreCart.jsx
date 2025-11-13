import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStoreData } from '@/layouts/StoreLayout';
import carritoService from '@/services/carritoService';
import authService from '@/services/auth';
import { ShoppingCart, ArrowRight, Plus, Minus, Trash2, Loader2, X } from 'lucide-react';

const StoreCart = () => {
  const store = useStoreData();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [cart, setCart] = useState(() => carritoService.obtenerCarrito(slug));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingItemId, setProcessingItemId] = useState(null);

  const loadCart = () => {
    const cartData = carritoService.obtenerCarrito(slug);
    setCart(cartData);
  };

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    loadCart();

    const unsubscribe = carritoService.suscribirACambios(loadCart);
    return () => unsubscribe();
  }, [slug]);

  const handleUpdateQuantity = (item, nuevaCantidad) => {
    if (nuevaCantidad > item.stock) {
      alert(`Stock insuficiente. Solo quedan ${item.stock} unidades.`);
      return;
    }
    setProcessingItemId(item.id);
    setTimeout(() => {
      carritoService.actualizarCantidad(slug, item.id, nuevaCantidad);
      setProcessingItemId(null);
    }, 100);
  };

  const handleRemoveItem = (item) => {
    setProcessingItemId(item.id);
    setTimeout(() => {
      carritoService.removerProducto(slug, item.id);
      setProcessingItemId(null);
    }, 100);
  };

  const handleGoToPayment = () => {
    navigate(`/tienda/${slug}/pagar`);
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="w-8 h-8 text-orange-600" />
          <h1 className="text-2xl font-bold">Mi Carrito</h1>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
            <p className="text-gray-500 mb-6">
              {store?.nombre ? `Agrega algunos productos increíbles de ${store.nombre}` : 'Agrega algunos productos increíbles.'}
            </p>
            <Link 
              to={`/tienda/${slug}`}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 inline-block font-medium"
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="w-8 h-8 text-orange-600" />
        <h1 className="text-2xl font-bold">Mi Carrito</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {cart.items.map(item => (
            <div 
              key={item.id} 
              className={`bg-white rounded-lg shadow-sm border p-4 flex items-center gap-4 transition-opacity ${
                processingItemId === item.id ? 'opacity-50' : 'opacity-100'
              }`}
            >
              <Link to={`/tienda/${slug}/producto/${item.id}`}>
                <img 
                  src={item.foto_principal || 'https://placehold.co/100x100/f0f0f0/ccc?text=Sin+Imagen'} 
                  alt={item.nombre}
                  className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                />
              </Link>

              <div className="flex-1">
                <Link to={`/tienda/${slug}/producto/${item.id}`} className="hover:underline">
                  <h3 className="font-semibold text-lg text-gray-800">{item.nombre}</h3>
                </Link>
                <p className="text-gray-600 text-sm">Bs. {item.precio}</p>
              </div>

              <div className="flex items-center gap-2 border rounded-lg p-1">
                <button
                  onClick={() => handleUpdateQuantity(item, item.cantidad - 1)}
                  disabled={processingItemId === item.id}
                  className="w-8 h-8 flex items-center justify-center text-orange-600 hover:bg-orange-50 rounded-md disabled:opacity-50"
                >
                  {processingItemId === item.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Minus className="w-4 h-4"/>}
                </button>
                <span className="w-10 text-center font-medium">{item.cantidad}</span>
                <button
                  onClick={() => handleUpdateQuantity(item, item.cantidad + 1)}
                  disabled={processingItemId === item.id || item.cantidad >= item.stock}
                  className="w-8 h-8 flex items-center justify-center text-orange-600 hover:bg-orange-50 rounded-md disabled:opacity-50"
                >
                  {processingItemId === item.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>}
                </button>
              </div>

              <div className="text-right w-24">
                <p className="font-semibold text-gray-800 text-lg">
                  Bs. {(item.precio * item.cantidad)?.toFixed(2) || '0.00'}
                </p>
                <button 
                  onClick={() => handleRemoveItem(item)}
                  disabled={processingItemId === item.id}
                  className="text-xs text-red-500 hover:text-red-700 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4 border-b pb-3">Resumen del Pedido</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.totalItems || 0} {cart.totalItems === 1 ? 'producto' : 'productos'})</span>
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
              
              {(cart.porcentajeEnvio || 0) > 0 && (
                <p className="text-xs text-gray-500 text-right -mt-2">
                  (Tasa del {cart.porcentajeEnvio}%)
                </p>
              )}
              {(!cart.porcentajeEnvio || cart.porcentajeEnvio === 0) && (cart.totalPrecio || 0) >= 1000 && (
                <p className="text-xs text-green-600 text-right -mt-2">
                  ¡Envío gratis alcanzado! (Compras &gt; 1000 Bs)
                </p>
              )}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-gray-900 font-bold text-lg">
                  <span>Total</span>
                  <span>Bs. {(cart.totalFinal || 0).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleGoToPayment}
                disabled={!isAuthenticated || cart.totalItems === 0}
                className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium text-lg flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Proceder con el Pago
                <ArrowRight className="w-5 h-5" />
              </button>
              
              {!isAuthenticated && (
                <p className="text-xs text-red-600 text-center mt-2">
                  Debes iniciar sesión para poder pagar.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreCart;