import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertCircle, Loader } from "lucide-react";
import UsuarioClienteForm from "@/Forms/UsuarioClienteForm"; // <-- Importa el nuevo form
import apiClient from "@/services/apiClient";
import { motion } from "framer-motion";

const EditarUsuarioCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    
    // 1. Pedimos los datos del usuario. Asumimos que /users/{id}/
    //    devuelve 'profile' y 'cliente_profile_data' anidados.
    apiClient.get(`/usuarios/users/${id}/`)
      .then(userData => {
        
        // 2. Mapeamos los datos al formato que espera el formulario
        setInitialData({
          email: userData.email,
          nombre: userData.profile?.nombre || "",
          apellido: userData.profile?.apellido || "",
          telefono: userData.profile?.telefono || "",
          direccion: userData.profile?.direccion || "",
          is_active: userData.is_active,
          
          // Mapeamos los datos anidados del cliente
          // El form espera 'cliente_profile', pero la API (según tu lista)
          // parece devolver 'cliente_profile_data'.
          cliente_profile: {
            nit: userData.cliente_profile_data?.nit || "",
            razon_social: userData.cliente_profile_data?.razon_social || "",
          }
        });
      })
      .catch((e) => setError("Error al cargar datos del cliente: " + (e.detail || e.message)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError("");
    try {
      // 2. Enviamos el PATCH con el payload del formulario
      await apiClient.patch(`/usuarios/users/${id}/`, formData);
      navigate("/dashboard/usuarios/clientes");
    } catch (e) {

      // --- INICIO DE LA CORRECCIÓN ---
      console.error("Error detallado:", e.response ? e.response.data : e.message);
      let errorMsg = "Error al actualizar el cliente."; // Mensaje por defecto

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="animate-spin h-10 w-10 text-blue-700" />
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
      
      {/* Error */}
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
            Editar Cliente: {initialData?.nombre} {initialData?.apellido}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Modifique los datos del cliente.
          </p>
        </div>
        <div className="p-6">
          <UsuarioClienteForm
            isEditMode={true}
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/dashboard/usuarios/clientes")} // <-- Regresa a la lista de clientes
            loading={saving}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default EditarUsuarioCliente;