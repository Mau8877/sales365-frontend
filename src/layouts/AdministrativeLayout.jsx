import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import authService from "@/services/auth";
import { generateMenuItems } from "@/pages/Admin/menuItems.jsx";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useIdleTimer } from "@/hooks/useIdleTimer";

/**
 * Aplana la estructura de menú (grupos -> items -> subItems)
 * en una lista simple de todos los enlaces posibles.
 */
const flattenMenuItems = (menuItems) => {
  const links = [];
  menuItems.forEach(group => {
    group.items.forEach(item => {
      if (item.subItems) {
        item.subItems.forEach(sub => {
          links.push({ path: sub.path, label: sub.label });
        });
      } else {
        links.push({ path: item.path, label: item.label });
      }
    });
  });
  return links;
};

/**
 * Encuentra el 'label' correcto para el 'pathname' actual.
 */
const getTitleForPath = (pathname, allLinks) => {
  // Manejar rutas especiales que no están en el menú
  if (pathname.endsWith("/profile")) return "Editar Perfil";
  
  // Ordenar los links por longitud de path (descendente).
  const sortedLinks = allLinks.sort((a, b) => b.path.length - a.path.length);

  // Encontrar el primer (y más específico) link que coincida
  const matchingLink = sortedLinks.find(link => pathname.includes(link.path));

  if (matchingLink) {
    return matchingLink.label;
  }
  
  return "Dashboard";
};


const AdministrativeLayout = () => {
  const currentUser = authService.getCurrentUser();
  const menuItems = generateMenuItems(currentUser);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const location = useLocation();
  const allLinks = flattenMenuItems(menuItems);
  const currentTitle = getTitleForPath(location.pathname, allLinks);

  const handleIdle = () => {
    console.warn("Sesión cerrada por inactividad de 15 minutos.");
    authService.logout(); 
  };

  useIdleTimer(handleIdle, 840000); 
  

  const toggleSidebar = () => setSidebarOpen((open) => !open);

  return (
    <div className="relative min-h-screen lg:flex bg-gray-50">
      <Sidebar
        menuItems={menuItems}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out lg:ml-72 bg-gray-50">
        <Header 
          toggleSidebar={toggleSidebar} 
          title={currentTitle} 
        />
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdministrativeLayout;