import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import StatusToggle from "@/components/StatusToggle";

// Componente de Campo genérico
const Field = ({ label, error, children }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">{label}</label>
    {children}
    {error && (
      <p className="text-sm text-red-600 flex items-center gap-1">
        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
        {error}
      </p>
    )}
  </div>
);

const CategoriaForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  isEditMode = false,
}) => {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    estado: true, // Por defecto 'true' al crear
  });
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (isEditMode && initialData) {
      setForm({
        nombre: initialData.nombre || "",
        descripcion: initialData.descripcion || "",
        estado: initialData.estado, 
      });
    } else {
      setForm({
        nombre: "",
        descripcion: "",
        estado: true,
      });
    }
  }, [initialData, isEditMode]);

  // Handlers
  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ nombre: true });

    if (!form.nombre) {
      return; 
    }

    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
    };
    
    // Solo enviamos el 'estado' si estamos editando
    if (isEditMode) {
      payload.estado = form.estado;
    }
    
    if (!isEditMode) {
       payload.estado = form.estado; // Asegura 'true' al crear
    }

    onSubmit(payload);
  };

  // Validación de errores
  const invalid = {
    nombre: touched.nombre && !form.nombre,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* --- LÓGICA DE ESTADO (SOLO EN EDITAR Y SI ESTÁ INACTIVO) --- */}
      {isEditMode && initialData && !initialData.estado && (
        <Field label="Estado de la Categoría">
          <div className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <StatusToggle
              isActive={form.estado}
              onToggle={() => setField("estado", !form.estado)}
            />
            <div>
              <p className="font-medium text-gray-800">
                {form.estado ? "Activo" : "Desactivado"}
              </p>
              <p className="text-sm text-gray-600">
                Esta categoría está desactivada. Puede reactivarla aquí.
              </p>
            </div>
          </div>
        </Field>
      )}
      
      {/* --- Campos del Formulario --- */}
      
      <Field label="Nombre de la Categoría *" error={invalid.nombre && "El nombre es requerido"}>
        <input
          value={form.nombre}
          onChange={(e) => setField("nombre", e.target.value)}
          onBlur={() => handleBlur("nombre")}
          disabled={loading}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
            invalid.nombre
              ? "border-red-500 ring-red-200"
              : "border-gray-300 focus:ring-blue-700"
          }`}
          placeholder="Ej: Laptops, Monitores, Limpieza"
        />
      </Field>

      <Field label="Descripción (Opcional)">
        <textarea
          value={form.descripcion}
          onChange={(e) => setField("descripcion", e.target.value)}
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700"
          placeholder="Escriba una breve descripción de la categoría..."
          rows={3}
        />
      </Field>

      {/* --- Botones de Acción --- */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={18} />
              Guardando...
            </>
          ) : isEditMode ? (
            "Guardar Cambios"
          ) : (
            "Crear Categoría"
          )}
        </button>
      </div>
    </form>
  );
};

export default CategoriaForm;