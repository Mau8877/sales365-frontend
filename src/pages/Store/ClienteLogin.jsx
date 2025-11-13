import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'; 

/**
 * Página de Login GLOBAL para Clientes.
 * Es una página de pantalla completa, similar a SaaSLogin.
 * NO usa useStoreData.
 */
const ClienteLogin = () => {
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useCustomerAuth(); 

  const location = useLocation();
  const fromPage = location.state?.from || "/tiendas";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(null);

  const error = authError || localError;

  const handleRegisterClick = () => {
    navigate(`/tiendas/register`, { state: { from: fromPage } });
  };

  const handleBackClick = () => {
    navigate(fromPage);
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError("Por favor, completa todos los campos.");
      return;
    }

    try {
      await login(email, password);
      
      navigate(fromPage, { replace: true });

    } catch (err) {
      // El Context ya guarda el error (ej. "Credenciales incorrectas")
      // No necesitamos hacer nada más aquí.
      console.error("Fallo el intento de login (manejado por Context)");
    }
  };

  return (
    <div className="h-screen bg-white flex overflow-hidden relative">
      <button
        onClick={handleBackClick}
        className="absolute top-4 left-4 flex items-center text-gray-700 hover:text-orange-600 transition-colors z-20"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        <span className="text-sm font-medium hidden sm:inline">Volver</span>
      </button>

      <div className="hidden md:flex md:w-3/5 bg-gradient-to-br from-orange-500 to-red-600 items-center justify-center px-12 relative overflow-hidden">
        <motion.div
          className="text-center text-white max-w-md z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ShoppingBag className="w-24 h-24 mx-auto text-white opacity-90 mb-6" />
          
          <h2 className="text-4xl font-bold">Bienvenido</h2>
          <h3 className="text-2xl font-bold mb-3">a SmartSales365</h3>
          <p className="text-lg text-orange-100">
            Inicia sesión para acceder a las mejores tiendas, todo en un solo lugar.
          </p>
        </motion.div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/10 rounded-full"></div>
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-white/10 rounded-full"></div>
      </div>

      <div className="w-full md:w-2/5 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="md:hidden flex justify-center mb-8">
            <ShoppingBag className="w-16 h-16 text-orange-600" />
          </div>

          <h1 className="text-2xl md:text-2xl font-bold text-gray-900 mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-gray-600 mb-6">
            Accede a tu cuenta global de SmartSales365.
          </p>

          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4"
              role="alert"
            >
              <p className="font-bold">Error de autenticación</p>
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-end">
              <a href="#" className="text-sm text-orange-600 hover:text-orange-500">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <motion.button
              type="submit"
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:bg-gray-400"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? "Iniciando Sesión..." : "Iniciar Sesión"}
            </motion.button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-center text-gray-600 mb-3 text-sm">
              ¿No tienes una cuenta?
            </p>
            <motion.button
              onClick={handleRegisterClick}
              className="w-full border border-orange-600 text-orange-600 py-2 px-4 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Regístrate aquí
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClienteLogin;