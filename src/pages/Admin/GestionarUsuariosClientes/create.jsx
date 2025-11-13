import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Loader } from "lucide-react";
import UsuarioClienteForm from "@/Forms/UsuarioClienteForm";
import apiClient from "@/services/apiClient";
import { motion } from "framer-motion";

const CrearUsuarioCliente = () => {
  const [saving, setSaving] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [clienteRolId, setClienteRolId] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Necesitamos buscar el ID del rol 'cliente' para asignarlo
    setLoadingConfig(true);
    apiClient.get("/usuarios/roles/?nombre=cliente") 
      .then(response => {
        // Asumiendo paginación o una lista simple
        const roles = response.results || response;
        const clienteRol = roles.find(r => r.nombre === 'cliente');
        
        if (clienteRol) {
          setClienteRolId(clienteRol.id);
        } else {
          setError("Error crítico: No se pudo encontrar el rol de 'cliente'. Contacte a soporte.");
        }
      })
      .catch((e) => {
        console.error("Error cargando rol de cliente:", e);
        setError(`Error al cargar la configuración: ${e.detail || e.message}`);
      })
      .finally(() => {
        setLoadingConfig(false);
      });
  }, []);

  const handleSubmit = async (formData) => {
    if (!clienteRolId) {
      setError("Error: El ID del rol de cliente no está cargado. No se puede crear el usuario.");
      return;
    }
    
    setSaving(true);
    setError("");

    // 2. Inyectamos el rol_id en los datos del formulario
    const payload = {
      ...formData,
      rol_id: clienteRolId,
    };

    try {
      // 3. Enviamos a la misma API de creación de usuarios
      await apiClient.post("/usuarios/users/", payload);
      navigate("/dashboard/usuarios/clientes"); 
    } catch (e) {
      
      // --- INICIO DE LA CORRECCIÓN ---
      console.error("Error detallado:", e.response ? e.response.data : e.message);
      let errorMsg = "Error al crear el cliente."; // Mensaje por defecto

      if (typeof e === 'string') {
          errorMsg = e;
      } else if (e && e.detail) {
          // Caso 1: Error simple de DRF (ej: { detail: "No encontrado." })
          errorMsg = e.detail;
      } else if (typeof e === 'object' && e !== null) {
          // Caso 2: Error de validación de DRF (ej: { email: ["ya existe"], profile: {...} })
          try {
              errorMsg = Object.entries(e).map(([key, value]) => {
                  let message;
                  if (Array.isArray(value)) {
                      // value es ["Error 1", "Error 2"]
                      message = value.join(' ');
                  } else if (typeof value === 'object' && value !== null) {
                      // value es { nested_key: ["Error 3"] }
                      // Object.values() SIEMPRE devuelve un array, por lo que .flat() es seguro aquí
                      message = Object.values(value).flat().join(' ');
                  } else {
                      // value es "Error simple"
                      message = String(value);
                  }
                  return `${key}: ${message}`;
              }).join('; ');
          } catch (parseError) {
              console.error("Error al parsear el error:", parseError);
              errorMsg = "Error de validación complejo. Revisa la consola.";
          }
      }
      
      setError(errorMsg);
      // --- FIN DE LA CORRECCIÓN ---

    } finally {
      setSaving(false);
    }
  };

  if (loadingConfig) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="animate-spin h-10 w-10 text-blue-700" />
        <p className="ml-3 text-gray-600">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Volver a Clientes</span>
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
            Registrar Nuevo Cliente
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Complete los datos para un nuevo cliente.
          </p>
        </div>
        <div className="p-6">
          <UsuarioClienteForm
            onSubmit={handleSubmit}
            onCancel={() => navigate("/dashboard/usuarios/clientes")} // <-- Regresa a la lista de clientes
            loading={saving}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default CrearUsuarioCliente;