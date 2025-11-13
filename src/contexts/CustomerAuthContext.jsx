import React, { createContext, useState, useContext, useEffect } from 'react';
// Importamos la INSTANCIA ÚNICA de tu AuthService unificado
import authService from '@/services/auth'; 
import { Loader } from 'lucide-react';

/**
 * Crea el Context.
 */
const CustomerAuthContext = createContext(null);

/**
 * Este es el Proveedor del Contexto.
 * Debe envolver las rutas de tu aplicación (ej. en main.jsx)
 * para que toda la app sepa si un CLIENTE está autenticado.
 */
export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Siempre inicia en true para chequear sesión
  const [error, setError] = useState(null);

  /**
   * Al cargar la aplicación, chequea si ya existe una sesión
   * en el localStorage (manejado por authService) y si
   * esa sesión pertenece a un 'cliente'.
   */
  useEffect(() => {
    // El servicio ya cargó el usuario en su constructor.
    const currentUser = authService.getCurrentUser();
    
    // IMPORTANTE: Solo cargamos el usuario en ESTE contexto
    // si el rol es 'cliente'. Si es 'admin', este contexto
    // lo ignorará y se mantendrá deslogueado.
    if (currentUser && authService.isCliente()) {
      setCustomer(currentUser);
      setIsAuthenticated(true);
    }
    
    // Termina la carga inicial, sea que haya encontrado usuario o no.
    setIsLoading(false); 
  }, []);

  /**
   * Llama al método de login de cliente del AuthService.
   */
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      // Llama al método específico para clientes
      await authService.loginCustomer(email, password); 
      
      // Si tiene éxito, actualiza el estado de este Context
      const currentUser = authService.getCurrentUser();
      setCustomer(currentUser);
      setIsAuthenticated(true);
      return currentUser; // Devuelve el usuario al componente de login
    } catch (err) {
      // Captura el error para mostrarlo en el formulario
      const errorMsg = err.response?.data?.error || "Error inesperado.";
      setError(err.response?.status === 401 ? "Correo o contraseña incorrectas." : errorMsg);
      throw err; // Lanza el error para que el componente de login sepa que falló
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Llama al método de logout de cliente del AuthService.
   */
  const logout = () => {
    // Llama al método específico de cliente (no redirige)
    authService.logoutCustomer(); 
    setCustomer(null);
    setIsAuthenticated(false);
  };

  /**
   * Llama al método de registro de cliente del AuthService.
   */
  const register = async (userData) => {
     setIsLoading(true);
     setError(null);
     try {
       // Llama al método específico de cliente
       await authService.registerCustomer(userData);
       
       // Si tiene éxito, actualiza el estado de este Context
       const currentUser = authService.getCurrentUser();
       setCustomer(currentUser);
       setIsAuthenticated(true);
       return currentUser; // Devuelve el usuario al componente de registro
     } catch (err) {
       // Manejo de errores de validación del backend (ej. "email ya existe")
       if (err.response?.status === 400 && err.response?.data) {
         const errorMessages = Object.values(err.response.data).flat().join(' ');
         setError(errorMessages || "No se pudo completar el registro.");
       } else {
         setError("No se pudo completar el registro.");
       }
       throw err; // Lanza el error para que el componente sepa que falló
     } finally {
       setIsLoading(false);
     }
  };

  /**
   * Muestra un loader global solo durante la carga inicial de la sesión.
   */
  if (isLoading) {
     return (
       <div className="flex items-center justify-center min-h-screen bg-white">
         <Loader className="w-12 h-12 animate-spin text-blue-600" />
       </div>
     );
  }

  /**
   * Pasa el estado y las funciones a todos los componentes hijos.
   */
  const value = {
    customer,
    isAuthenticated,
    isLoading, // Pasa el estado de 'cargando' para los botones de login/registro
    error,
    login,
    logout,
    register
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

/**
 * Este es el Hook personalizado que tus componentes (ej. StoreHeader, ClienteLogin)
 * usarán para acceder al contexto.
 */
export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth debe ser usado dentro de un CustomerAuthProvider');
  }
  return context;
};