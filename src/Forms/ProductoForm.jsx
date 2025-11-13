import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import StatusToggle from "@/components/StatusToggle";
import ImageUploader from "@/components/ImageUploader";
import apiClient from "@/services/apiClient";

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

const ProductoForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  isEditMode = false,
}) => {
  // --- Estados del Formulario ---
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "0.00",
    stock: 0,
    codigo_referencia: "",
    estado: true,
  });
  const [marcaId, setMarcaId] = useState("");
  const [categoriaIds, setCategoriaIds] = useState([]);
  const [photoState, setPhotoState] = useState({
    newFiles: [],
    filesToDelete: [],
    principalPhoto: null,
  });
  
  // --- Estados para Cargar Selects ---
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loadingSelects, setLoadingSelects] = useState(true);

  const [touched, setTouched] = useState({});

  // --- Carga de Datos para Selects (Marcas y Categorías) ---
  useEffect(() => {
    const fetchSelectData = async () => {
      setLoadingSelects(true);
      try {
        // Tu API de marcas y categorías (ajusta la URL si es necesario)
        const [marcasRes, catRes] = await Promise.all([
          // Pedimos todas las marcas activas
          apiClient.get('/comercial/marcas/?estado=true&page_size=1000'), 
          // Pedimos todas las categorías activas
          apiClient.get('/comercial/categorias/?estado=true&page_size=1000') 
        ]);
        setMarcas(marcasRes.results || []);
        setCategorias(catRes.results || []);
      } catch (error) {
        console.error("Error cargando marcas o categorías", error);
      } finally {
        setLoadingSelects(false);
      }
    };
    fetchSelectData();
  }, []);

  // --- Carga de Datos Iniciales (Modo Edición) ---
  useEffect(() => {
    if (isEditMode && initialData) {
      setForm({
        nombre: initialData.nombre || "",
        descripcion: initialData.descripcion || "",
        precio: initialData.precio || "0.00",
        stock: initialData.stock || 0,
        codigo_referencia: initialData.codigo_referencia || "",
        estado: initialData.estado,
      });
      // IDs de los selects
      setMarcaId(initialData.marca?.id || "");
      setCategoriaIds(initialData.categorias?.map(cat => cat.id) || []);
      // Las fotos se pasarán al ImageUploader
    }
  }, [initialData, isEditMode]);

  // --- Handlers ---
  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  };
  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  // --- Handler del Submit ---
  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ nombre: true, precio: true, stock: true, marcaId: true });

    // Validación
    if (!form.nombre || parseFloat(form.precio) <= 0 || !marcaId) {
      return; 
    }

    const payload = {
      textData: {
        ...form,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock, 10),
        marca_id: marcaId,
        categoria_ids: categoriaIds,
      },
      photoData: photoState,
    };
    
    // Solo enviamos el 'estado' si estamos editando (como en CategoriaForm)
    if (!isEditMode) {
      payload.textData.estado = form.estado; // Asegura 'true' al crear si se deja
    }

    onSubmit(payload);
  };

  // Validación de errores
  const invalid = {
    nombre: touched.nombre && !form.nombre,
    precio: touched.precio && parseFloat(form.precio) <= 0,
    stock: touched.stock && form.stock < 0,
    marcaId: touched.marcaId && !marcaId,
  };

  if (loadingSelects) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="animate-spin h-10 w-10 text-blue-700" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* --- Lógica de Estado (React-activar) --- */}
      {isEditMode && initialData && !initialData.estado && (
        <Field label="Estado del Producto">
          <div className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <StatusToggle
              isActive={form.estado}
              onToggle={() => setField("estado", !form.estado)}
            />
            <div>
              <p className="font-medium text-gray-800">{form.estado ? "Activo" : "Desactivado"}</p>
              <p className="text-sm text-gray-600">Este producto está desactivado. Puede reactivarlo aquí.</p>
            </div>
          </div>
        </Field>
      )}
      
      {/* --- Campos del Formulario --- */}
      
      <Field label="Nombre del Producto *" error={invalid.nombre && "El nombre es requerido"}>
        <input
          value={form.nombre}
          onChange={(e) => setField("nombre", e.target.value)}
          onBlur={() => handleBlur("nombre")}
          disabled={loading}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
            invalid.nombre ? "border-red-500 ring-red-200" : "border-gray-300 focus:ring-blue-700"
          }`}
          placeholder="Ej: Laptop Pro Modelo X"
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Precio *" error={invalid.precio && "El precio debe ser mayor a 0"}>
          <input
            type="number"
            step="0.01"
            value={form.precio}
            onChange={(e) => setField("precio", e.target.value)}
            onBlur={() => handleBlur("precio")}
            disabled={loading}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
              invalid.precio ? "border-red-500 ring-red-200" : "border-gray-300 focus:ring-blue-700"
            }`}
          />
        </Field>
        
        <Field label="Stock (Inventario) *" error={invalid.stock && "El stock no puede ser negativo"}>
          <input
            type="number"
            step="1"
            value={form.stock}
            onChange={(e) => setField("stock", e.target.value)}
            onBlur={() => handleBlur("stock")}
            disabled={loading}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
              invalid.stock ? "border-red-500 ring-red-200" : "border-gray-300 focus:ring-blue-700"
            }`}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Marca *" error={invalid.marcaId && "Debe seleccionar una marca"}>
          <select
            value={marcaId}
            onChange={(e) => setMarcaId(e.target.value)}
            onBlur={() => handleBlur("marcaId")}
            disabled={loading}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
              invalid.marcaId ? "border-red-500 ring-red-200" : "border-gray-300 focus:ring-blue-700"
            }`}
          >
            <option value="">Seleccione una marca...</option>
            {marcas.map(marca => (
              <option key={marca.id} value={marca.id}>{marca.nombre}</option>
            ))}
          </select>
        </Field>
        
        <Field label="Código de Referencia (Opcional)">
          <input
            value={form.codigo_referencia}
            onChange={(e) => setField("codigo_referencia", e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700"
            placeholder="Ej: LP-X-001"
          />
        </Field>
      </div>

      <Field label="Categorías (Opcional)">
        {/* Usaré checkboxes para Multi-Select, es más claro */}
        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-4 space-y-2">
          {categorias.length > 0 ? categorias.map(cat => (
            <label key={cat.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={categoriaIds.includes(cat.id)}
                onChange={() => {
                  const newIds = categoriaIds.includes(cat.id)
                    ? categoriaIds.filter(id => id !== cat.id)
                    : [...categoriaIds, cat.id];
                  setCategoriaIds(newIds);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              {cat.nombre}
            </label>
          )) : (
            <p className="text-gray-500 text-sm">No hay categorías activas.</p>
          )}
        </div>
      </Field>

      <Field label="Descripción (Opcional)">
        <textarea
          value={form.descripcion}
          onChange={(e) => setField("descripcion", e.target.value)}
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700"
          placeholder="Escriba detalles del producto..."
          rows={4}
        />
      </Field>

      {/* --- EL NUEVO UPLOADER DE FOTOS --- */}
      <ImageUploader
        initialPhotos={initialData?.fotos || []}
        maxFiles={5}
        onChange={setPhotoState} // El uploader nos notifica su estado
      />

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
            "Crear Producto"
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductoForm;