import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { "Content-Type": "application/json" },
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
         config.headers.Authorization = `Token ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          
          // --- LÓGICA MEJORADA ---
          // Comprueba si el 401 ocurrió en CUALQUIERA de las páginas de login
          const url = error.config?.url || "";
          // Ajusta estas rutas si las URL de tu API son diferentes
          const isSaaSLogin = url.includes("/usuarios/users/login/"); 
          const isCustomerLogin = url.includes("/usuarios/users/customer-login/");
          const isLoginRequest = isSaaSLogin || isCustomerLogin;
          // --- FIN LÓGICA MEJORADA ---
          
          if (!isLoginRequest) {
            // No es un login fallido, es un token expirado.
            // Hay que decidir a dónde redirigir.
            const userDataStr = localStorage.getItem("userData");
            
            // Limpiamos la sesión pase lo que pase
            localStorage.removeItem("token");
            localStorage.removeItem("userData");

            try {
              const userData = userDataStr ? JSON.parse(userDataStr) : null;
              
              if (userData && userData.rol === 'cliente') {
                // Si el usuario era cliente, lo mandamos al login de cliente
                window.location.href = "/tiendas/login";
              } else {
                // Si era Admin/Vendedor/SuperAdmin, lo mandamos al login de SaaS
                window.location.href = "/saas-login";
              }
            } catch (e) {
              // Si hay error leyendo el JSON, vamos a lo seguro
              window.location.href = "/saas-login";
            }
          }
        }

        // Aseguramos que el error mantenga su estructura original
        return Promise.reject(error);
      }
    );
  }

  // ========== AUTH ENDPOINTS (SaaS/Admin) ==========
  async login(email, password) {
    // Esta es tu función de login de SaaS/Admin
    return this.client.post("/usuarios/users/login/", { email, password });
  }

  async logout() {
    // Esta es tu función de logout de SaaS/Admin
    return this.client.post("/usuarios/users/logout/");
  }

  // === INICIO DE CÓDIGO NUEVO ===

  // ========== AUTH ENDPOINTS (Cliente) ==========

  /**
   * Llama al endpoint de login DE CLIENTE
   */
  async customerLogin(email, password) {
    // Apunta al endpoint que creamos en views.py
    return this.client.post("/usuarios/users/customer-login/", { email, password });
  }

  /**
   * Llama al endpoint de registro DE CLIENTE
   */
  async customerRegister(userData) {
    // userData es { nombre, apellido, email, password, telefono }
    // Apunta al endpoint que creamos en views.py
    return this.client.post("/usuarios/users/customer-register/", userData);
  }

  // === FIN DE CÓDIGO NUEVO ===


  // ========== (NUEVO) USER PROFILE ENDPOINTS (/me) ==========

  /**
   * Obtiene los datos completos del usuario autenticado
   */
  async getMe() {
    return this.client.get("/usuarios/users/me/");
  }

  /**
   * Actualiza los datos del perfil (email, nombre, etc.)
   */
  async updateMe(data) {
    // data = { email: "...", profile: { nombre: "..." } }
    return this.client.patch("/usuarios/users/me/", data);
  }

  /**
   * Cambia la contraseña del propio usuario
   */
  async changeMyPassword(data) {
    // data = { old_password: "...", new_password: "..." }
    return this.client.post("/usuarios/users/me/change-password/", data);
  }

  /**
   * Sube la foto de perfil del usuario
   */
  async uploadMyPhoto(formData) {
    // formData es un objeto FormData
    return this.client.post("/usuarios/users/me/upload-photo/", formData, {
    headers: {
      // Anulamos el 'Content-Type: application/json'
      // El navegador lo pondrá como 'multipart/form-data' automáticamente
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // ========== MÉTODOS HTTP GENÉRICOS ==========
  get(url, config) {
    return this.client.get(url, config);
  }
  post(url, data, config) {
    return this.client.post(url, data, config);
  }
  put(url, data, config) {
    return this.client.put(url, data, config);
  }
  patch(url, data, config) {
    return this.client.patch(url, data, config);
  }
  delete(url, config) {
    return this.client.delete(url, config);
  }
}

const apiClient = new ApiClient();
export default apiClient;