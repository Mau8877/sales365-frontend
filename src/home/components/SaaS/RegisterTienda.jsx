import { useState, useEffect, useRef } from "react";
import api from "@/services/publicApiClient";

// Importar Lucide React icons
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Users,
  Headphones,
  Download,
} from "lucide-react";

const RegisterTienda = ({ data, plan, onNext, onUpdate, onPlanSelect }) => {
  const [planes, setPlanes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    cargarPlanes();
  }, []);

  // Cuando se selecciona un plan, centrarlo en el carrusel
  useEffect(() => {
    if (plan && planes.length > 0) {
      centerPlan(plan.id);
    }
  }, [plan, planes]);

  const cargarPlanes = async () => {
    try {
      const response = await api.get("/saas/planes/");
      setPlanes(response);
      setIsLoading(false);
    } catch (error) {
      setError("Error al cargar los planes");
      setIsLoading(false);
    }
  };

  const centerPlan = (planId) => {
    const planIndex = planes.findIndex((p) => p.id === planId);
    if (planIndex !== -1) {
      let newIndex;
      if (planes.length <= 3) {
        newIndex = 0;
      } else {
        newIndex = Math.max(0, Math.min(planIndex - 1, planes.length - 3));
      }
      setCurrentIndex(newIndex);
    }
  };

  const getPlanColor = (planNombre) => {
    if (planNombre === "PRUEBA") return "gray";
    if (planNombre.includes("BASICO")) return "blue";
    if (planNombre.includes("PREMIUM")) return "purple";
    return "blue";
  };

  const getPlanGradient = (planNombre) => {
    const color = getPlanColor(planNombre);
    const gradients = {
      gray: "from-gray-500 to-gray-700",
      blue: "from-blue-500 to-blue-700",
      purple: "from-purple-500 to-purple-700",
    };
    return gradients[color];
  };

  const getPlanBorder = (planNombre) => {
    const color = getPlanColor(planNombre);
    const borders = {
      gray: "border-gray-400",
      blue: "border-blue-400",
      purple: "border-purple-400",
    };
    return borders[color];
  };

  const getPlanBadge = (planNombre) => {
    const color = getPlanColor(planNombre);
    const badges = {
      gray: "bg-gray-100 text-gray-800 border border-gray-300",
      blue: "bg-blue-100 text-blue-800 border border-blue-300",
      purple: "bg-purple-100 text-purple-800 border border-purple-300",
    };
    return badges[color];
  };

  const getPlanType = (planNombre) => {
    if (planNombre.endsWith("-M")) return "Mensual";
    if (planNombre.endsWith("-A")) return "Anual";
    return "Prueba";
  };

  const nextSlide = () => {
    if (currentIndex < planes.length - 3) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handlePlanSelect = (planItem) => {
    onPlanSelect(planItem);
    centerPlan(planItem.id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!plan) {
      setError("Por favor selecciona un plan");
      return;
    }
    if (!data.nombre || data.nombre.trim() === "") {
      setError("Por favor ingresa el nombre de la tienda");
      return;
    }
    onNext();
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Paso 1: Información de la Tienda
        </h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const visiblePlanes = planes.slice(currentIndex, currentIndex + 3);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Paso 1: Información de la Tienda
      </h2>
      <p className="text-gray-600 mb-8 text-center">
        Selecciona tu plan y nombre de tienda
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Carrusel de Planes */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-8 text-center text-lg">
            Selecciona tu Plan *
          </label>

          <div className="relative w-full">
            {/* Flecha izquierda */}
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 z-40 bg-white rounded-full p-3 shadow-2xl hover:shadow-3xl transition-all duration-300 border border-gray-200 hover:border-blue-500 hover:scale-110"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}

            {/* Contenedor del carrusel */}
            <div
              ref={carouselRef}
              className="flex justify-center items-stretch gap-4 px-12 py-6 w-full max-w-4xl mx-auto min-h-[320px]"
            >
              {visiblePlanes.map((planItem, index) => {
                const isSelected = plan?.id === planItem.id;

                return (
                  <div
                    key={planItem.id}
                    className={`flex-shrink-0 w-64 transition-all duration-500 ${
                      isSelected
                        ? "scale-105 transform-gpu"
                        : "scale-95 transform-gpu hover:scale-100"
                    }`}
                  >
                    <div
                      className={`h-full min-h-[280px] border-2 rounded-xl p-4 cursor-pointer transition-all duration-500 shadow-lg bg-white relative ${
                        isSelected
                          ? `${getPlanBorder(
                              planItem.nombre
                            )} ring-4 ring-opacity-50 shadow-xl ${
                              getPlanColor(planItem.nombre) === "blue"
                                ? "ring-blue-300"
                                : getPlanColor(planItem.nombre) === "purple"
                                ? "ring-purple-300"
                                : "ring-gray-300"
                            }`
                          : "border-gray-200 hover:border-gray-300 hover:shadow-xl"
                      }`}
                      onClick={() => handlePlanSelect(planItem)}
                    >
                      {/* Badge de Plan y Tipo */}
                      <div className="flex justify-between items-start mb-3">
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getPlanBadge(
                            planItem.nombre
                          )}`}
                        >
                          {planItem.nombre === "PRUEBA"
                            ? "PRUEBA"
                            : planItem.nombre.includes("BASICO")
                            ? "BÁSICO"
                            : "PREMIUM"}
                        </div>
                        <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium border border-gray-300">
                          {getPlanType(planItem.nombre)}
                        </div>
                      </div>

                      {/* Header con gradiente */}
                      <div
                        className={`bg-gradient-to-r ${getPlanGradient(
                          planItem.nombre
                        )} rounded-lg p-3 text-white mb-3 -mx-2 -mt-1`}
                      >
                        <div className="text-center mb-1">
                          <h3 className="font-bold text-base mb-1">
                            {planItem.get_nombre_display || planItem.nombre}
                          </h3>
                          <div className="text-2xl font-bold mb-1">
                            Bs {planItem.precio_mensual}
                            <span className="text-xs font-normal ml-1">
                              {planItem.nombre.endsWith("A") ? "/año" : "/mes"}
                            </span>
                          </div>
                        </div>

                        {planItem.dias_prueba > 0 && (
                          <div className="bg-white/20 rounded p-1 text-center mt-1">
                            <span className="text-xs font-semibold">
                              {planItem.dias_prueba} días de prueba
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Descripción */}
                      <p className="text-gray-600 mb-4 text-xs leading-relaxed text-center line-clamp-2 min-h-[2.5rem]">
                        {planItem.descripcion}
                      </p>

                      {/* Características con iconos Lucide */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-xs text-gray-700">
                          <Users className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          <span>Hasta {planItem.limite_usuarios} usuarios</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-700">
                          <Headphones className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          <span>Soporte 24/7</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-700">
                          <Download className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          <span>Actualizaciones gratis</span>
                        </div>
                      </div>

                      {/* Badge de selección */}
                      {isSelected && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1 transition-all duration-300">
                          <Check className="w-3 h-3" />
                          SELECCIONADO
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Flecha derecha */}
            {currentIndex < planes.length - 3 && (
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 z-40 bg-white rounded-full p-3 shadow-2xl hover:shadow-3xl transition-all duration-300 border border-gray-200 hover:border-blue-500 hover:scale-110"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Indicadores del carrusel */}
          {planes.length > 3 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: Math.max(1, planes.length - 2) }).map(
                (_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-blue-600 scale-125"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* Nombre de la Tienda */}
        <div className="max-w-md mx-auto pt-4">
          <label
            htmlFor="tiendaNombre"
            className="block text-sm font-medium text-gray-700 mb-2 text-center"
          >
            Nombre de la Tienda *
          </label>
          <input
            type="text"
            id="tiendaNombre"
            value={data.nombre || ""}
            onChange={(e) => onUpdate({ nombre: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center transition-all duration-300"
            placeholder="Ej: Mi Tienda Online"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto transition-all duration-300">
            <p className="text-red-700 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Botón Siguiente */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Siguiente →
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterTienda;
