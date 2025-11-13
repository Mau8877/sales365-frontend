import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertCircle, Loader } from "lucide-react";
import UsuarioTiendaForm from "../../../Forms/UsuarioTiendaForm";
import apiClient from "@/services/apiClient";
import authService from "@/services/auth";
import { motion } from "framer-motion";

const EditarUsuarioTienda = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    setLoading(true);
    let userData;
    let rolesData;

    // 1. Empezamos pidiendo los roles
    apiClient.get("/usuarios/roles/")
      .then(rolesRes => {
        rolesData = rolesRes || [];
        
        // 2. Luego, pedimos los datos base del usuario
        return apiClient.get(`/usuarios/users/${id}/`);
      })
      .then(userRes => {
        userData = userRes;
        const rolNombre = userData.rol?.nombre;

        // 3. Basado en el rol, pedimos el perfil específico
        if (rolNombre === 'vendedor') {
          return apiClient.get(`/usuarios/vendedores/${id}/`);
        } else if (rolNombre === 'admin') {
          return apiClient.get(`/usuarios/administradores/${id}/`);
        }
        // Si es cliente o no tiene rol, no necesitamos más datos
        return Promise.resolve(null);
      })
      .then(specificProfileData => {
        // 4. Filtramos los roles (igual que antes)
        if (currentUser.rol === 'superAdmin') {
          setRoles(rolesData);
        } else {
          setRoles(rolesData.filter(r => r.nombre === 'vendedor'));
        }

        // 5. Fusionamos TODOS los datos en initialData
        setInitialData({
          email: userData.email,
          rol: userData.rol?.id,
          nombre: userData.profile?.nombre || "",
          apellido: userData.profile?.apellido || "",
          telefono: userData.profile?.telefono || "",
          direccion: userData.profile?.direccion || "",
          is_active: userData.is_active, 
          // --- ¡DATOS FUSIONADOS! ---
          vendedor_profile: {
            tasa_comision: specificProfileData?.tasa_comision || "0.00",
            fecha_contratacion: specificProfileData?.fecha_contratacion || null,
          },
          admin_profile: {
            departamento: specificProfileData?.departamento || "",
            fecha_contratacion: specificProfileData?.fecha_contratacion || null,
          }
        });
      })
    .catch((e) => setError("Error al cargar datos: " + (e.detail || e.message)))
    .finally(() => setLoading(false));
  }, [id, currentUser.rol]);

  const handleSubmit = async (data) => {
    setSaving(true);
    setError("");
    try {
      await apiClient.patch(`/usuarios/users/${id}/`, data);
      navigate("/dashboard/usuarios/tienda");
    } catch (e) {
      console.error(e);
      // Mejoramos la visualización de errores de DRF
      const errorMsg = (typeof e === 'object' && e !== null)
        ? Object.entries(e).map(([key, value]) => `${key}: ${value.flat().join(' ')}`).join('; ')
        : "Error al actualizar el usuario.";
      setError(errorMsg || "Error al actualizar el usuario.");
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
          <span className="hidden sm:inline">Volver a Usuarios</span>
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
            Editar Usuario: {initialData?.nombre} {initialData?.apellido}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Modifique los datos del usuario.
          </p>
        </div>
        <div className="p-6">
          <UsuarioTiendaForm
            isEditMode={true}
            initialData={initialData}
            rolesOptions={roles}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/dashboard/usuarios/tienda")}
            loading={saving}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default EditarUsuarioTienda;