import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertCircle, Loader } from "lucide-react";
import ProductoForm from "@/Forms/ProductoForm";
import apiClient from "@/services/apiClient";
import { motion } from "framer-motion";

// Helper para formatear errores (igual que en Crear)
const formatApiErrors = (errorData) => {
  if (!errorData) return "Error al actualizar el producto.";
  return (typeof errorData === 'object' && errorData !== null)
    ? Object.entries(errorData)
        .map(([key, value]) => `${key}: ${value.flat().join(' ')}`)
        .join('; ')
    : "Error al actualizar el producto.";
};

// Overlay de carga 
const LoadingOverlay = ({ message }) => (
  <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-xl">
      <Loader className="animate-spin h-10 w-10 text-blue-700" />
      <p className="text-lg font-medium text-slate-700">{message}</p>
    </div>
  </div>
);

const EditarProducto = () => {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true); // Carga de la página
  const [saving, setSaving] = useState(false); // Carga del submit
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");

  // 1. Cargar los datos del producto
  useEffect(() => {
    setLoading(true);
    apiClient.get(`/comercial/productos/${id}/`)
      .then(response => {
        setInitialData(response);
      })
      .catch((e) => setError("Error al cargar el producto: " + (e.detail || e.message)))
      .finally(() => setLoading(false));
  }, [id]);

  /**
   * Maneja la lógica de actualización del producto en 4 pasos:
   * 1. Actualiza los datos de texto (PATCH al producto).
   * 2. Borra las fotos eliminadas (DELETE a la Foto API).
   * 3. Sube las fotos nuevas (POST a la acción upload-foto).
   * 4. Actualiza la foto principal (si es una foto existente).
   */
  const handleSubmit = async (payload) => {
    const { textData, photoData } = payload;
    
    setSaving(true);
    setError("");
    setLoadingMessage("Guardando cambios...");

    try {
      // --- PASO 1: Actualizar datos de texto ---
      // (Esto disparará el LogPrecioProducto si el precio cambió)
      await apiClient.patch(`/comercial/productos/${id}/`, textData);

      // --- PASO 2: Borrar fotos eliminadas ---
      // (Esto requiere el FotoViewSet que te añadiré abajo)
      if (photoData.filesToDelete.length > 0) {
        setLoadingMessage("Eliminando fotos antiguas...");
        const deletePromises = photoData.filesToDelete.map(fotoId =>
          apiClient.delete(`/comercial/fotos/${fotoId}/`)
        );
        await Promise.all(deletePromises);
      }

      // --- PASO 3: Subir fotos nuevas ---
      if (photoData.newFiles.length > 0) {
        setLoadingMessage(`Subiendo ${photoData.newFiles.length} foto(s)...`);
        const uploadPromises = photoData.newFiles.map(fileWrapper => {
          const formData = new FormData();
          formData.append('foto', fileWrapper.file);
          // Si la principal es una FOTO NUEVA, se marca aquí
          const isPrincipal = (photoData.principalPhoto?.id === fileWrapper.id);
          formData.append('principal', isPrincipal);

          return apiClient.post(
            `/comercial/productos/${id}/upload-foto/`, 
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
        });
        await Promise.all(uploadPromises);
      }
      
      // --- PASO 4: Actualizar foto principal (si es una foto EXISTENTE) ---
      const pp = photoData.principalPhoto;
      if (pp && pp.type === 'existing') {
        // Si la foto principal elegida es una que ya existía,
        // no se subió nada, pero debemos notificar al backend.
        
        // Verificamos si esta foto ya era la principal (no hacemos nada)
        const isAlreadyPrincipal = initialData.fotos.find(f => f.id === pp.id)?.principal;

        if (!isAlreadyPrincipal) {
          setLoadingMessage("Actualizando foto principal...");
          // (Esto requiere la acción 'set-principal-foto' que te añadiré)
          await apiClient.post(`/comercial/productos/${id}/set-principal-foto/`, { 
            foto_id: pp.id 
          });
        }
      }

      // --- PASO 5: Éxito total ---
      setLoadingMessage("");
      navigate("/dashboard/comercial/productos");

    } catch (e) {
      console.error("Error en la actualización:", e);
      const errorMsg = (e.response && e.response.data)
        ? formatApiErrors(e.response.data)
        : (e.message || "Ocurrió un error inesperado.");
      setError(errorMsg);
    } finally {
      setSaving(false);
      setLoadingMessage("");
    }
  };

  // --- Renderizado ---

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="animate-spin h-10 w-10 text-blue-700" />
      </div>
    );
  }

  return (
    <>
      {saving && <LoadingOverlay message={loadingMessage} />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Volver a Productos</span>
          </button>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <h3 className="text-red-800 font-semibold">Error</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Editar Producto: {initialData?.nombre}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Modifique los datos del producto.
            </p>
          </div>
          <div className="p-6">
            {/* Solo renderiza el form si tenemos los datos iniciales */}
            {initialData && (
              <ProductoForm
                isEditMode={true}
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/dashboard/comercial/productos")}
                loading={saving}
              />
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default EditarProducto;