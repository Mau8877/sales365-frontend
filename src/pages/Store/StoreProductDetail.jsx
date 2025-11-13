import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStoreData } from '@/layouts/StoreLayout';
import publicApiClient from '@/services/publicApiClient';
import carritoService from '@/services/carritoService';
import authService from '@/services/auth';
import { ArrowLeft, ShoppingCart, Share2, ZoomIn, Check, LogIn, Plus, Minus } from 'lucide-react';

const StoreProductDetail = () => {
  const { productId, slug } = useParams();
  const navigate = useNavigate();
  const store = useStoreData();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cantidadEnCarrito, setCantidadEnCarrito] = useState(0);
  const [actualizandoCarrito, setActualizandoCarrito] = useState(false);
  const autoPlayRef = useRef(null);

  const actualizarCantidadDesdeStorage = () => {
    if (producto && slug && isAuthenticated) {
      const carrito = carritoService.obtenerCarrito(slug); 
      if (carrito && carrito.items) {
        const item = carrito.items.find(item => item.id === producto.id);
        setCantidadEnCarrito(item?.cantidad || 0);
      } else {
        setCantidadEnCarrito(0);
      }
    } else {
      setCantidadEnCarrito(0);
    }
  };

  const checkAuth = () => {
    setIsAuthenticated(authService.isAuthenticated());
  };

  useEffect(() => {
    checkAuth();
    
    const handleCarritoUpdated = () => {
      actualizarCantidadDesdeStorage();
    };

    const unsubscribe = carritoService.suscribirACambios(handleCarritoUpdated);
    
    return () => {
      unsubscribe();
    };
  }, [slug, store.id, producto, isAuthenticated]);

  useEffect(() => {
    actualizarCantidadDesdeStorage();
  }, [producto, isAuthenticated]);

  const fotos = producto?.fotos ? [...producto.fotos].sort((a, b) => 
    b.principal - a.principal
  ) : [];
  
  const currentImage = fotos[selectedImageIndex]?.foto || null;

  useEffect(() => {
    if (fotos.length > 1 && isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setSelectedImageIndex((prev) => (prev + 1) % fotos.length);
      }, 10000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [fotos.length, isAutoPlaying]);

  const handleManualImageSelect = (index) => {
    setSelectedImageIndex(index);
    setIsAutoPlaying(false);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleImageHover = (e) => {
    if (!isZoomed) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fetchProducto = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await publicApiClient.get(
        `/comercial/productos/${productId}/public-detail/`
      );
      
      setProducto(data);
      
    } catch (err) {
      setError('No se pudo cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProducto();
    }
  }, [productId]);

  useEffect(() => {
    if (fotos.length > 0) {
      setSelectedImageIndex(0);
    }
  }, [fotos.length]);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const handleAuthRedirect = () => {
    alert('Debes iniciar sesión para agregar productos al carrito');
    navigate('/login', { 
      state: { 
        from: `/tienda/${slug}/producto/${productId}`,
        message: 'Inicia sesión para agregar productos al carrito'
      }
    });
  };

  const handleAgregarAlCarritoClick = () => {
    if (!isAuthenticated) return handleAuthRedirect();

    setActualizandoCarrito(true);
    
    setTimeout(() => {
      const resultado = carritoService.agregarProducto(
        slug, 
        producto, 
        1
      );
      setActualizandoCarrito(false);
    }, 50);
  };

  const handleIncrementar = () => {
    if (!isAuthenticated) return;

    setActualizandoCarrito(true);
    
    setTimeout(() => {
      const resultado = carritoService.agregarProducto(
        slug, 
        producto, 
        1
      );

      if (!resultado.success) {
        alert(`Error: ${resultado.message}`);
      }
      setActualizandoCarrito(false);
    }, 50);
  };

  const handleDecrementar = () => {
    if (!isAuthenticated) return;

    setActualizandoCarrito(true);

    setTimeout(() => {
      const nuevaCantidad = cantidadEnCarrito - 1;
      
      const resultado = carritoService.actualizarCantidad(
        slug, 
        producto.id, 
        nuevaCantidad
      );
      
      if (!resultado.success) {
        alert('Error al actualizar: ' + (resultado.message || 'Error desconocido'));
      }
      setActualizandoCarrito(false);
    }, 50);
  };

  const handleComprarAhora = () => {
    if (!isAuthenticated) return handleAuthRedirect();

    if (cantidadEnCarrito > 0) {
      navigate(`/tienda/${slug}/carrito`);
      return;
    }

    setActualizandoCarrito(true);
    
    setTimeout(() => {
      const resultado = carritoService.agregarProducto(
        slug, 
        producto, 
        1
      );
      
      setActualizandoCarrito(false);

      if (resultado.success) {
        navigate(`/tienda/${slug}/carrito`);
      } else {
        alert(`Error: ${resultado.message}`);
      }
    }, 50);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-xl"></div>
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link 
          to={`/tienda/${slug}`}
          className="inline-flex items-center text-orange-600 hover:text-orange-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a productos
        </Link>
        
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {error || 'Producto no encontrado'}
          </h3>
          <p className="text-gray-500 mb-4">
            El producto que buscas no está disponible.
          </p>
          <Link
            to={`/tienda/${slug}`}
            className="bg-orange-600 text-white px-6 py-2.5 rounded-xl hover:bg-orange-700 transition-colors font-medium inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  const displayDescription = showFullDescription 
    ? producto.descripcion 
    : producto.descripcion?.slice(0, 500);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Link 
        to={`/tienda/${slug}`}
        className="inline-flex items-center text-orange-600 hover:text-orange-800 mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a productos
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div 
              className="relative bg-gray-100 h-80 md:h-96 rounded-xl overflow-hidden cursor-zoom-in group"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleImageHover}
            >
              {currentImage ? (
                <>
                  <img
                    src={currentImage}
                    alt={producto.nombre}
                    className={`w-full h-full object-cover transition-transform duration-200 ${
                      isZoomed ? 'scale-150' : 'scale-100'
                    }`}
                    style={{
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                    }}
                  />
                  
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ZoomIn className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-lg">Imagen no disponible</span>
                </div>
              )}
            </div>
            
            {fotos.length > 1 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-700">
                    Imágenes ({selectedImageIndex + 1}/{fotos.length})
                    {fotos[selectedImageIndex]?.principal && (
                      <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        Principal
                      </span>
                    )}
                  </h4>
                  {!isAutoPlaying && (
                    <button
                      onClick={() => setIsAutoPlaying(true)}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Reanudar auto-play
                    </button>
                  )}
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {fotos.map((foto, index) => (
                    <button
                      key={index}
                      onClick={() => handleManualImageSelect(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 relative ${
                        selectedImageIndex === index
                          ? 'border-orange-500 shadow-md scale-105'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <img
                        src={foto.foto}
                        alt={`${producto.nombre} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {foto.principal && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {producto.nombre}
              </h1>
              
              <div className="space-y-2 mb-6">
                {producto.marca && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Marca:</span>{' '}
                    <span className="text-gray-800">{producto.marca.nombre}</span>
                  </p>
                )}
                
                {producto.categorias && producto.categorias.length > 0 && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Categoría:</span>{' '}
                    <span className="text-gray-800">
                      {producto.categorias.map(cat => cat.nombre).join(', ')}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <p className="text-4xl font-bold text-green-600">
                ${producto.precio}
              </p>
              <div className="flex gap-3 items-center">
                {copied && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    <Check className="w-4 h-4" />
                    URL copiada
                  </div>
                )}
                <button 
                  onClick={handleShare}
                  className="p-3 text-gray-400 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50 relative group"
                  title="Compartir producto"
                >
                  <Share2 className="w-5 h-5" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Copiar enlace
                  </div>
                </button>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <LogIn className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-yellow-800 font-medium text-sm">
                      Inicia sesión para comprar
                    </p>
                    <p className="text-yellow-700 text-sm">
                      Debes tener una cuenta para agregar productos al carrito y realizar compras.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {cantidadEnCarrito > 0 ? (
              <div className="flex gap-4 mb-6">
                <div className="flex-1 flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <button
                    onClick={handleDecrementar}
                    disabled={!isAuthenticated || actualizandoCarrito}
                    className="flex items-center justify-center w-10 h-10 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {actualizandoCarrito ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Minus className="w-5 h-5" />
                    )}
                  </button>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-semibold text-gray-800">
                      {cantidadEnCarrito} en carrito
                    </span>
                    <span className="text-sm text-gray-500">
                      ${(producto.precio * cantidadEnCarrito).toFixed(2)} total
                    </span>
                  </div>
                  
                  <button
                    onClick={handleIncrementar}
                    disabled={!isAuthenticated || producto.stock <= 0 || cantidadEnCarrito >= producto.stock || actualizandoCarrito}
                    className="flex items-center justify-center w-10 h-10 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {actualizandoCarrito ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </button>
                </div>
                
                <button 
                  onClick={handleComprarAhora}
                  disabled={!isAuthenticated || actualizandoCarrito}
                  className="flex-1 border-2 border-orange-600 text-orange-600 px-6 py-4 rounded-xl hover:bg-orange-600 hover:text-white transition-all duration-200 font-medium text-lg shadow-md hover:shadow-lg disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                >
                  Ir al Carrito
                </button>
              </div>
            ) : (
              <div className="flex gap-4 mb-6">
                <button 
                  onClick={handleAgregarAlCarritoClick}
                  disabled={!isAuthenticated || producto.stock <= 0 || actualizandoCarrito}
                  className="flex-1 bg-orange-600 text-white px-6 py-4 rounded-xl hover:bg-orange-700 transition-all duration-200 flex items-center justify-center gap-3 font-medium text-lg shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-md"
                >
                  {actualizandoCarrito ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-6 h-6" />
                      Agregar al Carrito
                    </>
                  )}
                </button>
                <button 
                  onClick={handleComprarAhora}
                  disabled={!isAuthenticated || producto.stock <= 0 || actualizandoCarrito}
                  className="flex-1 border-2 border-orange-600 text-orange-600 px-6 py-4 rounded-xl hover:bg-orange-600 hover:text-white transition-all duration-200 font-medium text-lg shadow-md hover:shadow-lg disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                >
                  {actualizandoCarrito ? 'Agregando...' : 'Comprar Ahora'}
                </button>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-700 mb-1">Disponibilidad</span>
                  <span className={`font-semibold ${producto.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {producto.stock > 0 ? `En stock (${producto.stock} disponibles)` : 'Sin stock'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-700 mb-1">SKU</span>
                  <span className="text-gray-600 font-mono">{producto.id}</span>
                </div>
                {producto.codigo_referencia && (
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700 mb-1">Código de referencia</span>
                    <span className="text-gray-600">{producto.codigo_referencia}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {producto.descripcion && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="font-semibold text-gray-800 mb-4 text-xl">Descripción del Producto</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                {displayDescription}
                {producto.descripcion.length > 500 && (
                  <button
                    onClick={toggleDescription}
                    className="ml-2 text-orange-600 hover:text-orange-700 font-medium text-lg"
                  >
                    {showFullDescription ? ' ... ver menos' : ' ... ver más'}
                  </button>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreProductDetail;