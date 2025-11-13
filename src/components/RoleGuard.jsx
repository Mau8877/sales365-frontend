import authService from "../services/auth"; // Asegúrate que la ruta a tu auth.js sea correcta

/**
 * Este componente envuelve a otros y solo los muestra si el usuario
 * tiene uno de los roles permitidos. El 'superAdmin' siempre tiene acceso.
 */
const RoleGuard = ({ children, allowedRoles = [] }) => {
  const user = authService.getCurrentUser();
  const userRole = user?.rol;

  // El superAdmin siempre tiene acceso.
  if (userRole === "superAdmin") {
    return children;
  }

  // Si se especificaron roles y el rol del usuario está en la lista, tiene acceso.
  if (allowedRoles.length > 0 && allowedRoles.includes(userRole)) {
    return children;
  }

  // Si no se especificaron roles, por defecto no se muestra nada para evitar accesos no deseados.
  // Podrías devolver un mensaje de "Acceso Restringido" si lo prefieres.
  return null;
};

export default RoleGuard;
