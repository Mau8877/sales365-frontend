import { useState } from "react";

const RegisterAdmin = ({ data, onNext, onBack, onUpdate }) => {
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!data.nombre?.trim()) newErrors.nombre = "El nombre es requerido";
    if (!data.apellido?.trim()) newErrors.apellido = "El apellido es requerido";
    if (!data.ci?.trim()) newErrors.ci = "El CI es requerido";
    if (!data.email?.trim()) newErrors.email = "El email es requerido";
    if (!data.password) newErrors.password = "La contraseña es requerida";

    if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Email inválido";
    }

    if (data.password && data.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  const handleInputChange = (field, value) => {
    onUpdate({ [field]: value });
    // Limpiar error del campo cuando el usuario escribe
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Paso 2: Información del Administrador
      </h2>
      <p className="text-gray-600 mb-6">
        Datos de la persona responsable de la tienda
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nombre *
            </label>
            <input
              type="text"
              id="nombre"
              value={data.nombre || ""}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.nombre ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Tu nombre"
            />
            {errors.nombre && (
              <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="apellido"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Apellido *
            </label>
            <input
              type="text"
              id="apellido"
              value={data.apellido || ""}
              onChange={(e) => handleInputChange("apellido", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.apellido ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Tu apellido"
            />
            {errors.apellido && (
              <p className="text-red-600 text-sm mt-1">{errors.apellido}</p>
            )}
          </div>
        </div>

        {/* CI y Teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="ci"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cédula de Identidad *
            </label>
            <input
              type="text"
              id="ci"
              value={data.ci || ""}
              onChange={(e) => handleInputChange("ci", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.ci ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="1234567"
            />
            {errors.ci && (
              <p className="text-red-600 text-sm mt-1">{errors.ci}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="telefono"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Teléfono (Opcional)
            </label>
            <input
              type="tel"
              id="telefono"
              value={data.telefono || ""}
              onChange={(e) => handleInputChange("telefono", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="12345678"
            />
          </div>
        </div>

        {/* Email y Contraseña */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={data.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Contraseña *
            </label>
            <input
              type="password"
              id="password"
              value={data.password || ""}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.password ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Mínimo 8 caracteres"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>
        </div>

        {/* Botones de Navegación */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            ← Anterior
          </button>

          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Siguiente →
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterAdmin;
