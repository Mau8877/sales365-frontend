import apiClient from "./apiClient";
let instance = null;

class AuthService {
  constructor() {
    if (instance) return instance;
    this.currentUser = null;
    this.loadUserFromStorage();
    instance = this;
  }

  loadUserFromStorage() {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
      } catch (error) {
        console.error("Error parsing userData from localStorage:", error);
        this.clearUserFromStorage();
      }
    }
  }

  saveUserToStorage(userData) {
    // Limpiamos el objeto ANTES de guardarlo
    const cleanUserData = this._cleanUserObject(userData);
    localStorage.setItem("userData", JSON.stringify(cleanUserData));
    localStorage.setItem("token", userData.token);
    this.currentUser = cleanUserData;
  }

  clearUserFromStorage() {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    this.currentUser = null;
  }

  // --- MÉTODO CRÍTICO: Limpiar el objeto usuario ---
  _cleanUserObject(userData) {
    if (!userData) return null;
    
    // Extraer solo el nombre del rol si es un objeto
    const rolNombre = this._extractRolNombre(userData.rol);
    
    return {
      id: userData.id || userData.user_id || userData.id_usuario,
      user_id: userData.user_id || userData.id_usuario,
      email: userData.email,
      nombre_completo: userData.nombre_completo,
      token: userData.token,
      tienda_id: userData.tienda_id || userData.tienda?.id || this._extractTiendaId(userData),
      rol: rolNombre,
      profile: userData.profile ? {
        id: userData.profile.id,
        nombre: userData.profile.nombre,
        apellido: userData.profile.apellido,
        foto_perfil: userData.profile.foto_perfil,
        telefono: userData.profile.telefono,
        direccion: userData.profile.direccion
      } : null
    };
  }

  // --- Nuevo método para extraer tienda_id de diferentes estructuras ---
  _extractTiendaId(userData) {
    if (userData.tienda_id) return userData.tienda_id;
    if (userData.tienda && userData.tienda.id) return userData.tienda.id;
    if (userData.user_tienda) return userData.user_tienda.id;
    return null;
  }

  // --- Extraer solo el nombre del rol ---
  _extractRolNombre(rol) {
    if (!rol) return null;
    
    if (typeof rol === 'object' && rol !== null) {
      return rol.nombre; // ← Solo el nombre, no el objeto completo
    }
    
    return rol;
  }

  updateLocalUser(freshUserData) {
    if (!freshUserData) return this.currentUser;
    
    // Limpiar los datos nuevos
    const cleanFreshData = this._cleanUserObject(freshUserData);
    
    // Fusionar con los datos actuales
    const mergedData = {
      ...this.currentUser,
      ...cleanFreshData,
    };

    // Actualizar localStorage y estado interno
    localStorage.setItem("userData", JSON.stringify(mergedData));
    this.currentUser = mergedData;
    
    return mergedData;
  }

  /*
    INICIO DE SESION PARA HERRAMIENTAS
  */
  async login(email, password) {
    try {
      const responseData = await apiClient.login(email, password);
      this.saveUserToStorage(responseData);
      return responseData;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw error;
    }
  }

  async logout() {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error(
        "Fallo en el logout del backend. La sesión local se limpiará de todas formas.",
        error
      );
    } finally {
      this.clearUserFromStorage();
      window.location.href = "/saas-login";
    }
  }

  /*
    INICIO DE SESION PARA CLIENTES
  */
  async loginCustomer(email, password) {
    try {
      // Llama al endpoint de Cliente
      const responseData = await apiClient.customerLogin(email, password);
      this.saveUserToStorage(responseData);
      return responseData;
    } catch (error) {
      console.error("Error al iniciar sesión (Cliente):", error);
      throw error;
    }
  }

  /**
   * NUEVO: Registro de Clientes (Global)
   */
  async registerCustomer(userData) {
    try {
      const responseData = await apiClient.customerRegister(userData);
      this.saveUserToStorage(responseData);
      return responseData;
    } catch (error) {
       console.error("Error al registrar (Cliente):", error);
       throw error;
    }
  }

  /**
   * NUEVO: Logout para Clientes (NO Redirige)
   */
  async logoutCustomer() {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error(
        "Fallo en el logout del backend (Cliente). Limpiando localmente.",
        error
      );
    } finally {
      this.clearUserFromStorage();
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem("token");
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getToken() {
    return localStorage.getItem("token");
  }

  _getRolNombre() {
    if (!this.currentUser || !this.currentUser.rol) return null;
    return this.currentUser.rol; 
  }

  isSuperAdmin() {
    return this._getRolNombre() === "superAdmin";
  }
  isAdmin() {
    return this._getRolNombre() === "admin";
  }
  isVendedor() {
    return this._getRolNombre() === "vendedor";
  }
  isCliente() {
    return this._getRolNombre() === "cliente";
  }
}

const authService = new AuthService();
export default authService;