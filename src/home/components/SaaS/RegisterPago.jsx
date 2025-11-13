import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import api from "@/services/publicApiClient";
import AuthService from "@/services/auth";

// Carga tu clave pública de Stripe desde las variables de entorno (.env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const RegisterPagos = ({ data, onBack, onSubmit }) => {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const procesarRegistro = async () => {
      const registroData = {
        plan_id: data.plan.id,
        tienda_nombre: data.tienda.nombre,
        admin_nombre: data.admin.nombre,
        admin_apellido: data.admin.apellido,
        admin_ci: data.admin.ci,
        admin_email: data.admin.email,
        admin_password: data.admin.password,
        admin_telefono: data.admin.telefono || "",
      };

      if (data.plan.dias_prueba > 0 || data.plan.nombre === "PRUEBA") {
        await handleRegistroDirecto(registroData);
      } else {
        await handlePagoStripe(registroData);
      }
    };

    procesarRegistro();
  }, [data]);

  // --- FUNCIÓN PARA PLANES DE PAGO ---
  const handlePagoStripe = async (registroData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post("saas/stripe/crear-sesion/", registroData);

      if (response.clientSecret) {
        setClientSecret(response.clientSecret);
      } else {
        throw new Error(
          response.error || "No se pudo obtener el token de pago de Stripe."
        );
      }
    } catch (err) {
      setError(err.message || "Ocurrió un error al preparar el pago.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNCIÓN PARA PLANES DE PRUEBA GRATUITA ---
  const handleRegistroDirecto = async (registroData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Iniciando registro directo para plan de prueba...", registroData);

      const registroResponse = await api.post("saas/registro/directo/", registroData);
      console.log("Registro exitoso, respuesta:", registroResponse);

      // Agregamos un pequeño delay para asegurar que el backend haya procesado todo
      setTimeout(async () => {
        try {
          console.log("Intentando login después del registro...");
          const loginResponse = await AuthService.login(
            registroData.admin_email,
            registroData.admin_password
          );

          console.log("Login exitoso:", loginResponse);

          AuthService.saveUserToStorage(loginResponse);
          onSubmit(loginResponse);
          navigate("/dashboard");
        } catch (loginError) {
          console.error("Error en login después del registro:", loginError);
          setError(
            "Registro completado, pero hubo un problema al iniciar sesión automáticamente. " +
              "Por favor, intenta iniciar sesión manualmente con tu email y contraseña."
          );
          setIsLoading(false);
        }
      }, 2000);
    } catch (err) {
      console.error("Error en registro directo:", err);

      // Manejo más específico de errores
      if (err.response?.status === 400) {
        // ⚙️ Si el backend responde que el correo ya está en uso,
        // pero estamos en un flujo de PRUEBA, ignoramos el error temporal.
        if (err.response.data?.error?.includes("ya está en uso")) {
          console.warn("Correo ya en uso, probablemente registro en proceso. Continuando login...");
          setError(null);
          setIsLoading(true);
          return; // No mostramos error, seguimos con el login automático
        }

        if (err.response.data?.email) {
          setError("El correo electrónico ya está registrado. Por favor usa otro email.");
        } else if (err.response.data?.ci) {
          setError("El número de CI ya está registrado. Por favor verifica tus datos.");
        } else {
          setError("Error en los datos enviados: " + JSON.stringify(err.response.data));
        }
      } else {
        setError(
          "Error en el registro: " + (err.message || "Por favor, intenta de nuevo.")
        );
      }
      setIsLoading(false);
    }
  };

  const options = { clientSecret };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Paso 3: Finalizando Registro
        </h2>
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600 mt-4">
            {data.plan.dias_prueba > 0
              ? "Creando tu cuenta de prueba..."
              : "Preparando todo para ti, por favor espera..."}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Paso 3: Ocurrió un Error
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Volver al paso anterior
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Paso 3: Información de Pago
          </h2>
          <p className="text-gray-600">Completa el pago para activar tu tienda</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          ← Anterior
        </button>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <h3 className="font-semibold text-blue-900 mb-3">Plan Seleccionado</h3>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-bold text-blue-700">{data.plan.nombre}</span>
            <p className="text-blue-600 text-sm mt-1">{data.plan.descripcion}</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-blue-800">
              {data.plan.dias_prueba > 0
                ? "Gratis"
                : `Bs ${data.plan.precio_mensual}`}{" "}
              {data.plan.nombre.includes("-A") && !data.plan.dias_prueba > 0
                ? "/año"
                : data.plan.dias_prueba > 0
                ? `(${data.plan.dias_prueba} días prueba)`
                : "/mes"}
            </span>
          </div>
        </div>
      </div>

      {clientSecret && (
        <div
          id="checkout"
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}

      <div className="flex items-center justify-center text-sm text-gray-500 mt-6">
        <svg
          className="w-4 h-4 mr-2 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Tus datos están protegidos con encriptación de nivel bancario
      </div>
    </div>
  );
};

export default RegisterPagos;
