import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Loader } from "lucide-react";
import ProductoForm from "@/Forms/ProductoForm";
import apiClient from "@/services/apiClient";
import { motion } from "framer-motion";

const formatApiErrors = (errorData) => {
  if (!errorData) return "Error al crear el producto.";
  return (typeof errorData === 'object' && errorData !== null)
    ? Object.entries(errorData)
        .map(([key, value]) => `${key}: ${value.flat().join(' ')}`)
        .join('; ')
    : "Error al crear el producto.";
};

const LoadingOverlay = ({ message }) => (
  <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-xl">
      <Loader className="animate-spin h-10 w-10 text-blue-700" />
      <p className="text-lg font-medium text-slate-700">{message}</p>
    </div>
  </div>
);

const CrearProducto = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    const { textData, photoData } = payload;
    
    setLoading(true);
    setError("");
    setLoadingMessage("Creando producto...");
    let newProductId = null;

    try {
      // PASO 1: Crear el producto (datos de texto)
      const createResponse = await apiClient.post("/comercial/productos/", textData);
      newProductId = createResponse.id;

      // PASO 2: Subir las fotos (si hay)
      if (photoData.newFiles && photoData.newFiles.length > 0) {
        
        const filesToUpload = photoData.newFiles;
        setLoadingMessage(`Subiendo ${filesToUpload.length} foto(s)...`);

        const uploadPromises = filesToUpload.map(fileWrapper => {
          const formData = new FormData();
          formData.append('foto', fileWrapper.file);
          const isPrincipal = (photoData.principalPhoto?.id === fileWrapper.id);
          formData.append('principal', isPrincipal);

          return apiClient.post(
            `/comercial/productos/${newProductId}/upload-foto/`, 
            formData,
            { 
              headers: { 'Content-Type': 'multipart/form-data' } 
            }
          );
        });

        await Promise.all(uploadPromises);
      }

      // PASO 3: Éxito total
      setLoadingMessage("");
      navigate("/dashboard/comercial/productos");

    } catch (e) {
      console.error("Error en la creación:", e);
      let errorMsg = "";

      if (newProductId && e.config?.url.includes('upload-foto')) {
        errorMsg = `El producto (ID: ${newProductId}) se creó, PERO falló la subida de fotos. Por favor, edite el producto para añadirlas.`;
      
      } else if (e.response && e.response.data) {
        errorMsg = formatApiErrors(e.response.data);
      
      } else {
        errorMsg = e.message || "Ocurrió un error inesperado.";
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <>
      {loadingMessage && <LoadingOverlay message={loadingMessage} />}
    
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
              Registrar Nuevo Producto
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Complete los datos para un nuevo producto.
            </p>
          </div>
          <div className="p-6">
            <ProductoForm
              onSubmit={handleSubmit}
              onCancel={() => navigate("/dashboard/comercial/productos")}
              loading={loading}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default CrearProducto;