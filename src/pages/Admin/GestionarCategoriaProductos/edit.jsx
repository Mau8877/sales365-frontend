import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertCircle, Loader } from "lucide-react";
import CategoriaForm from "@/Forms/CategoriaForm";
import apiClient from "@/services/apiClient";
import { motion } from "framer-motion";

const EditarCategoria = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/comercial/categorias/${id}/`)
      .then(response => {
        setInitialData(response);
      })
      .catch((e) => setError("Error al cargar la categoría: " + (e.detail || e.message)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data) => {
    setSaving(true);
    setError("");
    try {
      await apiClient.patch(`/comercial/categorias/${id}/`, data);
      navigate("/dashboard/comercial/categorias");
    } catch (e) {
      console.error(e);
      const errorMsg = (typeof e === 'object' && e !== null)
        ? Object.entries(e).map(([key, value]) => `${key}: ${value.flat().join(' ')}`).join('; ')
        : "Error al actualizar la categoría.";
      setError(errorMsg || "Error al actualizar la categoría.");
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
          <span className="hidden sm:inline">Volver a Categorías</span>
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
            Editar Categoría: {initialData?.nombre}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Modifique los datos de la categoría.
          </p>
        </div>
        <div className="p-6">
          <CategoriaForm
            isEditMode={true}
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/dashboard/comercial/categorias")}
            loading={saving}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default EditarCategoria;
