import apiClient from './apiClient';
import authService from './auth';

// Esta es la clave que usaremos en localStorage
const CARRITO_KEY = 'smartSales365_Carrito';

class CarritoService {
  constructor() {
    // 1. Cargar el carrito desde localStorage al iniciar
    this.carrito = this._cargarCarritoDeStorage();

    // 2. Cada vez que notificamos un cambio, guardamos en storage
    window.addEventListener('carritoUpdated', this._guardarCarritoEnStorage.bind(this));
  }

  // ==================== MÉTODOS PRIVADOS DE STORAGE ====================

  _cargarCarritoDeStorage() {
    try {
      const data = localStorage.getItem(CARRITO_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error("Error al cargar carrito de localStorage", e);
      return {};
    }
  }
  
  _guardarCarritoEnStorage() {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(this.carrito));
  }

  _notificarCambio() {
    window.dispatchEvent(new Event('carritoUpdated'));
  }

  _obtenerCarritoDeTienda(tiendaSlug) {
    if (!this.carrito[tiendaSlug]) {
      this.carrito[tiendaSlug] = {
        items: [],
        totalItems: 0,
        totalPrecio: 0, 
        costoEnvio: 0,
        totalFinal: 0,
        porcentajeEnvio: 0, // Para mostrarle al usuario qué tasa se usó
      };
    }
    return this.carrito[tiendaSlug];
  }

  /**
   * Recalcula los totales, INCLUYENDO LA LÓGICA DE ENVÍO.
   */
  // --- ¡CAMBIO GRANDE AQUÍ! ---
  _recalcularTotales(carritoTienda) {
    // 1. Calcular Items y Subtotal
    carritoTienda.totalItems = carritoTienda.items.reduce((total, item) => total + item.cantidad, 0);
    const subtotal = carritoTienda.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    carritoTienda.totalPrecio = subtotal; // totalPrecio ahora es el Subtotal

    let costoEnvio = 0;
    let porcentajeEnvio = 0;

    if (subtotal === 0) {
      porcentajeEnvio = 0;
      costoEnvio = 0;
    } else if (subtotal < 100) { // Menos de 100 bs
      porcentajeEnvio = 15; // 15% (Tasa alta para carritos pequeños)
      costoEnvio = subtotal * 0.15;
    } else if (subtotal < 500) { // Entre 100 y 499.99 bs
      porcentajeEnvio = 10; // 10% (Tasa estándar)
      costoEnvio = subtotal * 0.10;
    } else if (subtotal < 1000) { // Entre 500 y 999.99 bs
      porcentajeEnvio = 5; // 5% (Tasa reducida)
      costoEnvio = subtotal * 0.05;
    } else { // 1000 bs o más
      porcentajeEnvio = 0; // 0% (Envío Gratis)
      costoEnvio = 0;
    }
    // ================================================================

    // 3. Guardar totales finales
    carritoTienda.porcentajeEnvio = porcentajeEnvio;
    carritoTienda.costoEnvio = costoEnvio;
    carritoTienda.totalFinal = subtotal + costoEnvio;
  }

  // ==================== MÉTODOS DE LIMPIEZA ====================
  
  limpiarCarritoTienda(tiendaSlug) {
    this.carrito[tiendaSlug] = {
      items: [],
      totalItems: 0,
      totalPrecio: 0,
      costoEnvio: 0,
      totalFinal: 0,
      porcentajeEnvio: 0,
    };
    this._notificarCambio();
  }

  limpiarCarritosLocales() {
    this.carrito = {};
    this._notificarCambio();
  }


  // ==================== OPERACIONES LOCALES (SÍNCRONAS) ====================

  obtenerCarrito(tiendaSlug) {
    return this._obtenerCarritoDeTienda(tiendaSlug);
  }

  agregarProducto(tiendaSlug, producto, cantidad = 1) {
    try {
      const carritoTienda = this._obtenerCarritoDeTienda(tiendaSlug);
      
      if (producto.stock <= 0) {
         return { success: false, message: 'Este producto está agotado.' };
      }

      const itemExistente = carritoTienda.items.find(item => item.id === producto.id);
      
      if (itemExistente) {
        const nuevaCantidad = itemExistente.cantidad + cantidad;
        if (producto.stock < nuevaCantidad) {
           return { 
             success: false, 
             message: `Stock insuficiente. Ya tienes ${itemExistente.cantidad}. Disponible: ${producto.stock}` 
           };
        }
        itemExistente.cantidad = nuevaCantidad;
      } else {
        if (producto.stock < cantidad) {
           return { success: false, message: `Stock insuficiente. Disponible: ${producto.stock}` };
        }
        
        const fotoPrincipalUrl = 
            producto.fotos?.find((f) => f.principal)?.foto ||
            producto.fotos?.[0]?.foto ||
            null;

        carritoTienda.items.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          foto_principal: fotoPrincipalUrl,
          stock: producto.stock,
          cantidad: cantidad
        });
      }
      
      this._recalcularTotales(carritoTienda);
      this._notificarCambio();
      
      return { 
        success: true, 
        message: `¡${producto.nombre} agregado!`,
        source: 'local'
      };

    } catch (error) {
      return { success: false, message: error.message, source: 'local' };
    }
  }

  removerProducto(tiendaSlug, productoId) {
    const carritoTienda = this._obtenerCarritoDeTienda(tiendaSlug);
    carritoTienda.items = carritoTienda.items.filter(item => item.id !== productoId);
    
    this._recalcularTotales(carritoTienda);
    this._notificarCambio();
    return { success: true, source: 'local' };
  }

  actualizarCantidad(tiendaSlug, productoId, nuevaCantidad) {
    if (nuevaCantidad <= 0) {
      return this.removerProducto(tiendaSlug, productoId);
    }
    
    const carritoTienda = this._obtenerCarritoDeTienda(tiendaSlug);
    const item = carritoTienda.items.find(item => item.id === productoId);
    
    if (item) {
      if (item.stock < nuevaCantidad) {
        return { 
          success: false, 
          message: `Stock insuficiente. Disponible: ${item.stock}`,
          source: 'local'
        };
      }

      item.cantidad = nuevaCantidad;
      this._recalcularTotales(carritoTienda);
      this._notificarCambio();
      return { success: true, source: 'local' };
    }
    return { success: false, error: 'Item no encontrado', source: 'local' };
 }

  // ==================== OPERACIÓN DE API (ASÍNCRONA) ====================

  async confirmarPedido(tiendaSlug, storeId) {
    if (!authService.isAuthenticated()) {
      return { success: false, message: 'Usuario no autenticado', status: 401 };
    }
    
    const carritoLocal = this.obtenerCarrito(tiendaSlug);
    
    if (!carritoLocal || carritoLocal.items.length === 0) {
      return { success: false, message: "Tu carrito está vacío." };
    }
    
    const datosPedido = {
      tienda_id: storeId,
      items: carritoLocal.items.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad
      }))
    };

    try {
      const response = await apiClient.post('/comercial/carritos/confirmar-pedido/', datosPedido);
      this.limpiarCarritoTienda(tiendaSlug);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || "Error al confirmar el pedido",
        status: error.response?.status,
        errorData: error.response?.data
      };
    }
  }

  // ==================== SUSCRIPCIÓN Y AYUDANTES ====================

  getTotalItems(tiendaSlug) {
    return this._obtenerCarritoDeTienda(tiendaSlug).totalItems;
  }
  
  getTotalPrecio(tiendaSlug) {
    // Esto devuelve el SUB-TOTAL
    return this._obtenerCarritoDeTienda(tiendaSlug).totalPrecio;
  }
  
  estaVacio(tiendaSlug) {
     return this.getTotalItems(tiendaSlug) === 0;
  }

  suscribirACambios(callback) {
    const handler = () => {
      callback();
    };
    
    window.addEventListener('carritoUpdated', handler);
    
    return () => {
      window.removeEventListener('carritoUpdated', handler);
    };
  }
}

const carritoService = new CarritoService();
export default carritoService;