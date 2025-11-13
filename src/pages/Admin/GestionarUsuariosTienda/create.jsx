import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import UsuarioTiendaForm from "../../../Forms/UsuarioTiendaForm";
import apiClient from "@/services/apiClient";
import authService from "@/services/auth";
import { motion } from "framer-motion";

const CrearUsuarioTienda = () => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    apiClient.get("/usuarios/roles/") 
      .then(response => {
        const allRoles = response || []; 
        
        // Filtramos en el frontend
        if (currentUser.rol === 'superAdmin') {
           setRoles(allRoles.filter(r => r.nombre === 'admin' || r.nombre === 'vendedor'));
        } else {
           setRoles(allRoles.filter(r => r.nombre === 'vendedor'));
        }
      })
      .catch((e) => {
        console.error("Error cargando roles:", e);
        setError(`Error al cargar la lista de roles: ${e.detail || e.message}`);
      });
  }, [currentUser.rol]);

  const handleSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      await apiClient.post("/usuarios/users/", data);
      navigate("/dashboard/usuarios/tienda");
    } catch (e) {
      console.error(e);
      // Mejoramos la visualización de errores de DRF
      const errorMsg = (typeof e === 'object' && e !== null)
        ? Object.entries(e).map(([key, value]) => `${key}: ${value.flat().join(' ')}`).join('; ')
        : "Error al crear el usuario.";
      setError(errorMsg || "Error al crear el usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header con botón de volver */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)} // Vuelve a la página anterior
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Volver a Usuarios</span>
        </button>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-red-800 font-semibold">Error</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Registrar Nuevo Usuario de Tienda
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Complete los datos para un nuevo Admin o Vendedor.
          </p>
        </div>
        <div className="p-6">
          <UsuarioTiendaForm
            rolesOptions={roles}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/dashboard/usuarios/tienda")}
            loading={loading}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default CrearUsuarioTienda;