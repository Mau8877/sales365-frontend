import React, { useState, useEffect, useMemo } from "react";
import { Loader, Eye, EyeOff } from "lucide-react";
import StatusToggle from "@/components/StatusToggle";

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

const UsuarioTiendaForm = ({
  initialData = null,
  rolesOptions = [],
  onSubmit,
  onCancel,
  loading = false,
  isEditMode = false,
}) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    rol: "",
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    is_active: true,
    vendedor_profile: {
      tasa_comision: "0.00",
      fecha_contratacion: null,
    },
    admin_profile: {
      departamento: "",
      fecha_contratacion: null,
    }
  });
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isEditMode && initialData) {
      setForm({
        email: initialData.email || "",
        password: "",
        rol: initialData.rol || "",
        nombre: initialData.nombre || "",
        apellido: initialData.apellido || "",
        telefono: initialData.telefono || "",
        direccion: initialData.direccion || "",
        is_active: initialData.is_active,
        vendedor_profile: {
          tasa_comision: initialData.vendedor_profile?.tasa_comision || "0.00",
          fecha_contratacion: initialData.vendedor_profile?.fecha_contratacion || null,
        },
        admin_profile: {
          departamento: initialData.admin_profile?.departamento || "",
          fecha_contratacion: initialData.admin_profile?.fecha_contratacion || null,
        }
      });
    } else {
      setForm({
        email: "", password: "", rol: "", nombre: "", apellido: "",
        telefono: "", direccion: "", is_active: true,
        vendedor_profile: { tasa_comision: "0.00", fecha_contratacion: null },
        admin_profile: { departamento: "", fecha_contratacion: null }
      });
    }
  }, [initialData, isEditMode]);

  const selectedRolNombre = useMemo(() => {
    if (!form.rol) return null;
    const rolObj = rolesOptions.find(r => r.id === parseInt(form.rol, 10));
    return rolObj ? rolObj.nombre : null;
  }, [form.rol, rolesOptions]);

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
      password: true,
      rol: true,
      nombre: true,
    });

    if (!form.email || !form.nombre || !form.rol || (!isEditMode && !form.password)) {
      return;
    }
    
    const payload = {
      email: form.email,
      rol_id: form.rol,
      profile: {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        direccion: form.direccion,
      },
      vendedor_profile: selectedRolNombre === 'vendedor' ? form.vendedor_profile : null,
      admin_profile: selectedRolNombre === 'admin' ? form.admin_profile : null,
    };

    if (!isEditMode) {
      if (form.password) {
        payload.password = form.password;
      }
      payload.is_active = form.is_active; 
    }
    
    if (isEditMode && initialData && !initialData.is_active && form.is_active) {
      payload.is_active = true; 
    }
    
    onSubmit(payload);
  };

  const invalid = {
    email: touched.email && !form.email,
    nombre: touched.nombre && !form.nombre,
    rol: touched.rol && !form.rol,
    password: !isEditMode && touched.password && !form.password,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                  ? "El usuario será reactivado al guardar."
                  : "El usuario permanecerá desactivado."}
              </p>
            </div>
          </div>
        </Field>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Field label="Nombre *" error={invalid.nombre && "Nombre es requerido"}>
          <input
            value={form.nombre}
            onChange={(e) => setField("nombre", e.target.value)}
            onBlur={() => handleBlur("nombre")}
            disabled={loading}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${invalid.nombre ? "border-red-500 ring-red-200" : "border-gray-300 focus:ring-blue-700"}`}
            placeholder="Ej: Leonel"
          />
        </Field>
        <Field label="Apellido">
          <input
            value={form.apellido}
            onChange={(e) => setField("apellido", e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700"
            placeholder="Ej: Barrios"
          />
        </Field>
        <Field label="Rol *" error={invalid.rol && "Rol es requerido"}>
          <select
            value={form.rol}
            onChange={(e) => setField("rol", e.target.value)}
            onBlur={() => handleBlur("rol")}
            disabled={loading || rolesOptions.length === 0 || isEditMode} 
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${invalid.rol ? "border-red-500 ring-red-200" : "border-gray-300 focus:ring-blue-700"} ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="" disabled>Seleccione un rol...</option>
            {rolesOptions.map((rol) => (
              <option key={rol.id} value={rol.id} className="capitalize">{rol.nombre}</option>
            ))}
          </select>
          {isEditMode && <p className="text-xs text-gray-500 mt-1">El rol no se puede cambiar en la edición.</p>}
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
            placeholder="ejemplo@tienda.com"
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${invalid.password ? "border-red-500 ring-red-200" : "border-gray-300 focus:ring-blue-700"} pr-10`} // <-- padding-right
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
      {selectedRolNombre === 'vendedor' && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          <h3 className="font-semibold text-gray-800">Perfil de Vendedor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Tasa de Comisión (%)">
              <input
                type="number"
                step="0.01"
                value={form.vendedor_profile.tasa_comision}
                onChange={(e) => setForm(f => ({ ...f, vendedor_profile: { ...f.vendedor_profile, tasa_comision: e.target.value } }))}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700"
                placeholder="Ej: 5.50"
              />
            </Field>
            <Field label="Fecha de Contratación (Vendedor)">
              <input
                type="date"
                value={form.vendedor_profile.fecha_contratacion || ''} 
                onChange={(e) => setForm(f => ({ ...f, vendedor_profile: { ...f.vendedor_profile, fecha_contratacion: e.target.value } }))}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700"
              />
            </Field>
          </div>
        </div>
      )}

      {selectedRolNombre === 'admin' && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          <h3 className="font-semibold text-gray-800">Perfil de Administrador</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Departamento">
              <input
                type="text"
                value={form.admin_profile.departamento}
                onChange={(e) => setForm(f => ({ ...f, admin_profile: { ...f.admin_profile, departamento: e.target.value } }))}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700"
                placeholder="Ej: Ventas, Administración"
              />
            </Field>
            <Field label="Fecha de Contratación (Admin)">
              <input
                type="date"
                value={form.admin_profile.fecha_contratacion || ''}
                onChange={(e) => setForm(f => ({ ...f, admin_profile: { ...f.admin_profile, fecha_contratacion: e.target.value } }))}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700"
              />
            </Field>
          </div>
        </div>
      )}
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
            "Crear Usuario"
          )}
        </button>
      </div>
    </form>
  );
};

export default UsuarioTiendaForm;