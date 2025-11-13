import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'; 

/**
 * Página de Registro GLOBAL para Clientes.
 * Layout centrado, sin columnas, con fondo naranja.
 */
const ClienteRegister = () => {
  const navigate = useNavigate();
  const { register, isLoading, error: authError } = useCustomerAuth(); 
  const location = useLocation();
  const fromPage = location.state?.from || "/tiendas";

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    passwordConfirm: '',
  });
  const [localError, setLocalError] = useState(null);

  const error = authError || localError;

  const handleLoginClick = () => {
    navigate('/tiendas/login', { state: { from: fromPage } });
  };

  const handleBackClick = () => {
    navigate(fromPage); 
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setLocalError(null);

    const { nombre, apellido, email, password, passwordConfirm, telefono } = formData;

    if (!nombre || !apellido || !email || !password || !passwordConfirm) {
      setLocalError("Por favor, completa todos los campos obligatorios.");
      return;
    }
    if (password !== passwordConfirm) {
      setLocalError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setLocalError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      await register({ nombre, apellido, email, password, telefono });
      navigate(fromPage, { replace: true });
    } catch (err) {
      console.error("Fallo el intento de registro (manejado por Context)");
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4 relative overflow-hidden">
      
      <button
        onClick={handleBackClick}
        className="absolute top-4 left-4 flex items-center text-white hover:text-orange-100 transition-colors z-20"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        <span className="text-sm font-medium hidden sm:inline">Volver</span>
      </button>

      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/10 rounded-full"></div>
      <div className="absolute -top-16 -right-16 w-80 h-80 bg-white/10 rounded-full"></div>

      <motion.div
        className="w-full max-w-md bg-white rounded-lg shadow-xl p-6 relative z-10 max-h-[95vh] overflow-y-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        
        <div className="text-center mb-4">
          <UserPlus className="w-16 h-16 text-orange-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Registro de Cliente
          </h1>
          <p className="text-gray-600">
            Crea tu cuenta global de SmartSales365.
          </p>
        </div>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4"
            role="alert"
          >
            <p className="font-bold">Error de registro</p>
            <p>{error}</p>
          </div>
        )}

        <form className="space-y-3" onSubmit={handleRegisterSubmit}>
          
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre*
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Ana"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="apellido"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Apellido*
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Pérez"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo Electrónico*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="tu@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          
          <div>
            <label
              htmlFor="telefono"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Teléfono (Opcional)
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="71234567"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contraseña*
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="•••••••• (Mín. 8 caracteres)"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
          
          <div>
            <label
              htmlFor="passwordConfirm"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirmar Contraseña*
            </label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <motion.button
            type="submit"
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:bg-gray-400"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {isLoading ? "Creando Cuenta..." : "Crear Cuenta"}
          </motion.button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-center text-gray-600 mb-3 text-sm">
            ¿Ya tienes una cuenta?
          </p>
          <motion.button
            onClick={handleLoginClick}
            className="w-full border border-orange-600 text-orange-600 py-2 px-4 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Inicia Sesión aquí
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ClienteRegister;