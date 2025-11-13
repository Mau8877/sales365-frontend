import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"; // Se quitó useLocation
import { LogOut, Menu, User, Store } from "lucide-react";
import authService from "@/services/auth";
import apiClient from "@/services/apiClient";

/**
 * Muestra el avatar del usuario.
 * (Este componente estaba perfecto, no se toca)
 */
const Avatar = ({ user }) => {
  const avatarUrl = user?.profile?.foto_perfil;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="Foto de perfil"
        className="w-10 h-10 rounded-full object-cover"
      />
    );
  }

  let nameForInitials = (user?.profile?.nombre && user?.profile?.apellido)
    ? `${user.profile.nombre} ${user.profile.apellido}`
    : user?.nombre_completo;

  const initials = nameForInitials
    ? nameForInitials
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?"; 

  return (
    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
      {initials}
    </div>
  );
};

// --- CORRECCIÓN 1: El Header ahora acepta 'title' como prop ---
const Header = ({ toggleSidebar, title }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const menuRef = useRef(null);

  // (Todo el código de useEffect, handleLogout, getRolNombre, getNombreCompleto
  // es idéntico y se queda igual, ya que es lógica propia del Header)

  useEffect(() => {
    if (currentUser?.rol && typeof currentUser.rol === 'object') {
      console.error("❌ ERROR: currentUser.rol sigue siendo un objeto:", currentUser.rol);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchFullUserData = async () => {
      try {
        const fullUserData = await apiClient.getMe();
        const mergedUserData = authService.updateLocalUser(fullUserData);
        setCurrentUser(mergedUserData);
      } catch (error) {
        console.error("Error al refrescar datos del usuario:", error);
      }
    };
    fetchFullUserData();
  }, []); 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]); 

  const handleLogout = async () => {
    await authService.logout();
  };

  const getRolNombre = () => {
    if (!currentUser || !currentUser.rol) {
      return "Usuario";
    }
    if (typeof currentUser.rol === 'object' && currentUser.rol !== null) {
      return currentUser.rol.nombre || "Usuario";
    }
    return currentUser.rol;
  };

  const getNombreCompleto = () => {
    if (!currentUser) return "Usuario";
    if (currentUser?.profile?.nombre) {
      return `${currentUser.profile.nombre} ${currentUser.profile.apellido || ''}`.trim();
    }
    return currentUser?.nombre_completo || "Usuario";
  };
  
  // --- CORRECCIÓN 2: Se eliminó 'useLocation' y toda la función 'getTitle()' ---

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-40">
      {/* Sección Izquierda: Menú móvil y Título */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-gray-600 hover:text-gray-900"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
          {/* --- CORRECCIÓN 3: Se usa la prop 'title' --- */}
          {title}
        </h1>
      </div>

      {/* Sección Derecha: Información y Menú de Perfil (Sin cambios) */}
      <div className="flex items-center gap-4">
        <div>
          <div className="font-semibold text-right text-gray-800">
            {getNombreCompleto()}
          </div>
          <div className="text-xs text-right text-gray-500 capitalize">
            {getRolNombre()}
          </div>
        </div>

        {/* Menú Desplegable de Avatar */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Avatar user={currentUser} />
          </button>

          {/* Contenido del Menú Desplegable (Sin cambios) */}
          {isMenuOpen && (
            <div
              ref={menuRef} 
              className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden ring-1 ring-black ring-opacity-5 z-50"
            >
              <div className="py-1">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getNombreCompleto()}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {currentUser?.email || "No email"}
                  </p>
                </div>
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 transition-all duration-150 ease-in-out cursor-pointer"
                  >
                    <User size={18} />
                    <span>Editar Perfil</span>
                  </Link>

                  { (currentUser.rol === 'admin') && (
                    <Link
                      to="/dashboard/editstore"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 transition-all duration-150 ease-in-out cursor-pointer"
                    >
                      <Store size={18} />
                      <span>Editar Tienda</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100 transition-all duration-150 ease-in-out cursor-pointer"
                  >
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                  </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;