import { Navigate } from "react-router-dom";
import authService from "../services/auth"; // Asegúrate que la ruta sea correcta

const ProtectedRoute = ({ children }) => {
  // 1. Lógica síncrona: lee de authService (que lee de localStorage)
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // 2. Si NO está autenticado, va al login.
  if (!isAuthenticated) {
    return <Navigate to="/saas-login" replace />;
  }

  // 3. Si es cliente, no puede ver el admin dashboard.
  //    (Usamos el nuevo método seguro que arreglaremos en el Paso 2)
  if (authService.isCliente()) {
    return <Navigate to="/tiendas" replace />; 
  }

  // 4. Es admin, superAdmin o vendedor: tiene acceso.
  return children;
};

export default ProtectedRoute;