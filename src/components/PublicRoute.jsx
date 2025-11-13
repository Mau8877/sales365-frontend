import { Navigate } from "react-router-dom";
import authService from "../services/auth";

const PublicRoute = ({ children }) => {
  // 1. Lógica síncrona.
  const isAuthenticated = authService.isAuthenticated();

  // 2. Si SÍ está autenticado, no puede ver el login, va al dashboard.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Si no está autenticado, puede ver la página pública.
  return children;
};

export default PublicRoute;