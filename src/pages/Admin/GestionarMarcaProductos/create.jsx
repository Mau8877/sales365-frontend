import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import MarcaForm from "@/Forms/MarcaForm";
import apiClient from "@/services/apiClient";
import { motion } from "framer-motion";

/**
 * Página contenedora para crear una nueva Marca.
 */
const CrearMarca = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      // Usamos el endpoint de la API de comercial
      await apiClient.post("/comercial/marcas/", data);
      navigate("/dashboard/comercial/marcas");
    } catch (e) {
      console.error(e);
      // Formateo de error de DRF (copiado de tu ejemplo)
      const errorMsg = (typeof e === 'object' && e !== null)
        ? Object.entries(e).map(([key, value]) => `${key}: ${value.flat().join(' ')}`).join('; ')
        : "Error al crear la marca.";
      setError(errorMsg || "Error al crear la marca.");
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
          <span className="hidden sm:inline">Volver a Marcas</span>
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
            Registrar Nueva Marca
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Complete los datos para la nueva marca.
          </p>
        </div>
        <div className="p-6">
          <MarcaForm
            onSubmit={handleSubmit}
            onCancel={() => navigate("/dashboard/comercial/marcas")}
            loading={loading}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default CrearMarca;

