import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AuthService from "@/services/auth";

const SaaSLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterClick = () => {
    navigate("/saas-register");
  };

  const handleBackClick = () => {
    navigate("/");
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userData = await AuthService.login(email, password);

      if (
        userData.rol === "admin" ||
        userData.rol === "vendedor" ||
        userData.rol === "superAdmin"
      ) {
        navigate("/dashboard", { replace: true });
      } else if (userData.rol === "cliente") {
        navigate("/tiendas", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Error de login:", err);
      if (err.response?.status === 401) {
        setError("Correo o contraseña incorrectas.");
      } else if (err.response?.status === 400) {
        setError("Por favor, completa todos los campos.");
      } else {
        setError("Ocurrió un error inesperado. Intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white flex overflow-hidden relative">
      {/* Botón Volver */}
      <button
        onClick={handleBackClick}
        className="absolute top-4 left-4 flex items-center text-gray-700 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        <span className="text-sm font-medium hidden sm:inline">Volver</span>
      </button>

      {/* Sección izquierda */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo móvil */}
          <div className="md:hidden flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <img
                src="/Icono365.png"
                alt="SmartSales365"
                className="w-16 h-16 object-contain"
              />
              <span className="text-3xl font-bold text-gray-900">
                SmartSales365
              </span>
            </div>
          </div>

          <h1 className="text-2xl md:text-2xl font-bold text-gray-900 mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-gray-600 mb-6">
            Accede al panel de control de tu tienda
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-end">
              <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <motion.button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
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
              className="w-full border border-blue-600 text-blue-600 py-2 px-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Registra tu Tienda
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Sección derecha */}
      <div className="hidden md:flex md:w-3/5 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center px-12">
        <motion.div
          className="text-center text-white max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img
              src="/Icono365white.png"
              alt="SmartSales365"
              className="w-16 h-16 object-contain"
            />
            <h2 className="text-4xl font-bold">SmartSales365</h2>
          </div>
          <h3 className="text-2xl font-bold mb-3">¡Bienvenido de vuelta!</h3>
          <p className="text-lg text-blue-100">
            Gestiona tu negocio de manera inteligente.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SaaSLogin;