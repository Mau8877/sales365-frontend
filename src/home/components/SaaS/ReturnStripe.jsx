import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/services/publicApiClient";
import AuthService from "@/services/auth";

const ReturnStripe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("--- ReturnStripe.jsx: El componente se ha montado ---");

    const currentUser = AuthService.getCurrentUser();
    console.log("1. Resultado de AuthService.getCurrentUser():", currentUser);

    if (currentUser && currentUser.token) {
      console.log(
        "2. DECISIÓN: Se encontró un usuario existente. Redirigiendo..."
      );
      setStatus("error");
      setError(
        "Ya has completado el registro. Esta página ha expirado. Redirigiendo al dashboard..."
      );
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 2500);
    } else {
      console.log(
        "2. DECISIÓN: No se encontró un usuario. Iniciando confirmación de pago..."
      );
      confirmarPago();
    }
  }, []); // El array vacío es correcto, queremos que se ejecute solo una vez al montar.

  const confirmarPago = async () => {
    console.log("3. Dentro de confirmarPago()...");
    const sessionId = searchParams.get("session_id");
    console.log("4. session_id encontrado en la URL:", sessionId);

    if (!sessionId) {
      console.error("Error Crítico: No se encontró 'session_id' en la URL.");
      setStatus("error");
      setError(
        "ID de sesión no encontrado. La URL de retorno parece estar incorrecta."
      );
      return;
    }

    try {
      console.log(
        "5. Llamando al backend en 'saas/stripe/confirmar/' con el session_id..."
      );
      const response = await api.post("saas/stripe/confirmar/", {
        session_id: sessionId,
      });

      console.log("6. RESPUESTA COMPLETA DEL BACKEND:", response);

      if (response && response.status === "success") {
        console.log(
          "7. ÉXITO: El backend devolvió 'status: success'. Guardando usuario y redirigiendo."
        );
        AuthService.saveUserToStorage({
          user_id: response.user_id,
          token: response.token,
          rol: response.rol,
          tienda_id: response.tienda_id,
          nombre_completo: response.nombre_completo,
          email: response.email,
        });
        setStatus("success");
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 3000);
      } else {
        // Esto se ejecuta si el backend responde pero no con un 'status: success'
        console.error(
          "8. FALLO LÓGICO: El backend respondió sin 'status: success'. Respuesta:",
          response
        );
        throw new Error(
          response.error || "El servidor no confirmó el pago correctamente."
        );
      }
    } catch (err) {
      console.error("9. ¡ERROR! El bloque 'catch' se ha disparado.");
      console.error("   Objeto de error completo:", err);

      const errorMessage =
        err.response?.data?.error || // Para errores HTTP (4xx, 5xx) de Axios
        err.message || // Para errores lanzados manualmente por nosotros
        "Ocurrió un error inesperado al conectar con el servidor.";

      console.error("   Mensaje de error final que se mostrará:", errorMessage);
      setError(errorMessage);
      setStatus("error");
    }
  };

  // --- El JSX para mostrar los estados no cambia ---
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Confirmando tu pago...
          </h2>
          <p className="text-gray-600 mt-2">
            Estamos creando tu cuenta de forma segura. <br /> ¡Ya casi está
            listo!
          </p>
        </div>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <svg
            className="w-16 h-16 mx-auto text-red-500 mb-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Aviso</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/admin")}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <svg
          className="w-16 h-16 mx-auto text-green-500 mb-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Registro Completado!
        </h2>
        <p className="text-gray-600 mb-6">
          Tu tienda ha sido activada. Serás redirigido a tu dashboard en unos
          segundos.
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
};

export default ReturnStripe;
