import React, { useState, useEffect } from "react";
import { Loader, Eye, EyeOff } from "lucide-react";
import StatusToggle from "@/components/StatusToggle";

// --- Componente Field (copiado de tu modelo) ---
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

// --- Formulario Específico para Clientes ---
const UsuarioClienteForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  isEditMode = false,
}) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    is_active: true,
    // Perfil específico de Cliente
    cliente_profile: {
      nit: "",
      razon_social: "",
    }
  });
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isEditMode && initialData) {
      setForm({
        email: initialData.email || "",
        password: "",
        nombre: initialData.nombre || "",
        apellido: initialData.apellido || "",
        telefono: initialData.telefono || "",
        direccion: initialData.direccion || "",
        is_active: initialData.is_active,
        // Mapeamos los datos del cliente
        cliente_profile: {
          nit: initialData.cliente_profile?.nit || "",
          razon_social: initialData.cliente_profile?.razon_social || "",
        },
      });
    } else {
      // Resetea al estado inicial vacío para 'Crear'
      setForm({
        email: "", password: "", nombre: "", apellido: "",
        telefono: "", direccion: "", is_active: true,
        cliente_profile: { nit: "", razon_social: "" }
      });
    }
  }, [initialData, isEditMode]);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      email: true,
      nombre: true,
      password: true,
    });

    // Validación simple
    if (!form.email || !form.nombre || (!isEditMode && !form.password)) {
      return;
    }
    
    // Construimos el payload
    const payload = {
      email: form.email,
      // Datos del perfil base
      profile: {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        direccion: form.direccion,
      },
      // Datos del perfil de cliente
      cliente_profile: form.cliente_profile,
    };

    // Añadir contraseña solo al crear
    if (!isEditMode && form.password) {
      payload.password = form.password;
    }
    
    // Manejar reactivación
    if (isEditMode && initialData && !initialData.is_active && form.is_active) {
      payload.is_active = true; 
    }
    
    // Enviar (El componente padre añadirá el rol_id)
    onSubmit(payload);
  };

  // --- Validación de campos requeridos ---
  const invalid = {
    email: touched.email && !form.email,
    nombre: touched.nombre && !form.nombre,
    password: !isEditMode && touched.password && !form.password,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* --- Toggle de Activación (Solo en Edición) --- */}
      {isEditMode && initialData?.is_active === false && (
        <Field label="Estado del Usuario">
          <div className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <StatusToggle
              isActive={form.is_active}
              onToggle={() => setField("is_active", !form.is_active)} 
            />
            <div>
              <p className="font-medium text-gray-800">
                {form.is_active ? "Activo" : "Desactivado"}
              </p>
              <p className="text-sm text-gray-600">
                {form.is_active
                  ? "El cliente será reactivado al guardar."
                  : "El cliente permanecerá desactivado."}
              </p>
            </div>
          </div>
        </Field>
      )}

      {/* --- Perfil Base (Nombre, Apellido, Email) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Nombre *" error={invalid.nombre && "Nombre es requerido"}>
          <input
            value={form.nombre}
            onChange={(e) => setField("nombre", e.target.value)}
            onBlur={() => handleBlur("nombre")}
            disabled={loading}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${invalid.nombre ? "border-red-500 ring-red-200" : "border-gray-300 focus:ring-blue-700"}`}
            placeholder="Ej: Juan"
          />
        </Field>
        <Field label="Apellido">
          <input
            value={form.apellido}
            onChange={(e) => setField("apellido", e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700"
            placeholder="Ej: Pérez"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Email *" error={invalid.email && "Email es requerido"}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            disabled={loading} 
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${invalid.email ? "border-red-500 ring-red-200" : "border-gray-300 focus:ring-blue-700"}`}
            placeholder="ejemplo@cliente.com"
          />
        </Field>
        {!isEditMode && (
          <Field label="Contraseña *" error={invalid.password && "Contraseña es requerida"}>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} 
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                disabled={loading}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${invalid.password ? "border-red-500 ring-red-200" : "border-gray-300 focus:ring-blue-700"} pr-10`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>
        )}
      </div>

      {/* --- Perfil Base (Teléfono, Dirección) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Teléfono">
          <input
            value={form.telefono}
            onChange={(e) => setField("telefono", e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700"
            placeholder="Ej: 71234567"
          />
        </Field>
        <Field label="Dirección">
          <input
            value={form.direccion}
            onChange={(e) => setField("direccion", e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700"
            placeholder="Ej: Av. Principal #123"
          />
        </Field>
      </div>
      
      {/* --- Perfil Específico de CLIENTE --- */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
        <h3 className="font-semibold text-gray-800">Perfil de Cliente (Facturación)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="NIT / CI">
            <input
              type="text"
              value={form.cliente_profile.nit}
              onChange={(e) => setForm(f => ({ ...f, cliente_profile: { ...f.cliente_profile, nit: e.target.value } }))}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700"
              placeholder="Ej: 123456789"
            />
          </Field>
          <Field label="Razón Social">
             <input
              type="text"
              value={form.cliente_profile.razon_social}
              onChange={(e) => setForm(f => ({ ...f, cliente_profile: { ...f.cliente_profile, razon_social: e.target.value } }))}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700"
              placeholder="Ej: Mi Empresa S.R.L."
            />
          </Field>
        </div>
      </div>

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
            "Crear Cliente"
          )}
        </button>
      </div>
    </form>
  );
};

export default UsuarioClienteForm;