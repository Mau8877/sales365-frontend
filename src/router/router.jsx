import { createBrowserRouter } from "react-router-dom";

// Páginas Publicas
import SaaSHomePage from "@/home/SaaSHomePage.jsx";
import SaaSLogin from "@/home/SaaSLogin.jsx";
import SaaSRegister from "@/home/SaaSRegister.jsx";
import ReturnStripe from "@/home/components/SaaS/ReturnStripe.jsx";
import ClienteLogin from "@/pages/Store/ClienteLogin.jsx";
import ClienteRegister from "@/pages/Store/ClienteRegister.jsx";
import ClientePerfil from "@/pages/Store/ClientePerfil.jsx";
import ClienteHistorialPagos from "@/pages/Store/ClienteHistorialPagos.jsx";

// Paginas para clientes
import StoreHomePage from "@/home/StoreHomePage.jsx";
import StoreLayout from "@/layouts/StoreLayout.jsx";
import StoreCart from "@/pages/Store/StoreCart.jsx";
import StoreProductDetail from "@/pages/Store/StoreProductDetail.jsx";
import StoreProductsPage from "@/pages/Store/StoreProductsPage.jsx";
import StorePay from "@/pages/Store/StorePay.jsx";
import SuccessPay from "@/pages/Store/SuccessPay.jsx";

// Componentes de protección de rutas
import PublicRoute from "@/components/PublicRoute.jsx";
import ProtectedRoute from "@/components/ProtectedRoute.jsx";

// Paginas para administradores
import AdminDashboard from "@/pages/Admin/AdminDashboard.jsx";
import AdministrativeLayout from "@/layouts/AdministrativeLayout.jsx";
import EditProfile from "@/pages/Admin/EditProfile.jsx";
import EditStore from "@/pages/Admin/EditStore.jsx";

import GestionarUsuariosClientes from "@/pages/Admin/GestionarUsuariosClientes/index.jsx"
import CrearUsuarioCliente from "@/pages/Admin/GestionarUsuariosClientes/create.jsx"
import EditarUsuarioCliente from "@/pages/Admin/GestionarUsuariosClientes/edit.jsx"

import GestionarUsuariosTienda from "@/pages/Admin/GestionarUsuariosTienda/index.jsx"
import CrearUsuarioTienda from "@/pages/Admin/GestionarUsuariosTienda/create.jsx"
import EditarUsuarioTienda from "@/pages/Admin/GestionarUsuariosTienda/edit.jsx"

import Bitacora from "@/pages/Admin/Bitacora/index.jsx"

import GestionarMarcaProductos from "@/pages/Admin/GestionarMarcaProductos/index.jsx"
import CrearMarca from "@/pages/Admin/GestionarMarcaProductos/create.jsx"
import EditarMarca from "@/pages/Admin/GestionarMarcaProductos/edit.jsx"

import GestionarCategoriaProductos from "@/pages/Admin/GestionarCategoriaProductos/index.jsx"
import CrearCategoria from "@/pages/Admin/GestionarCategoriaProductos/create.jsx"
import EditarCategoria from "@/pages/Admin/GestionarCategoriaProductos/edit.jsx"

import GestionarProductos from "@/pages/Admin/GestionarProductos/index.jsx"
import CrearProducto from "@/pages/Admin/GestionarProductos/create.jsx"
import EditarProducto from "@/pages/Admin/GestionarProductos/edit.jsx"

import PagoProductos from "@/pages/Admin/PagoProductos/index.jsx"

import GenerarNotaVenta from "@/pages/Admin/GenerarNotaVenta/index.jsx"
import EditarVenta from "@/pages/Admin/GenerarNotaVenta/edit.jsx"

import HistorialVentas from "@/pages/Admin/HistorialVentas/index.jsx"

import GenerarReportesVoz from "@/pages/Admin/GenerarReportes/indexVoice.jsx"
//import GenerarReportes from "@/pages/Admin/GenerarReportes/index.jsx"


import GenerarPrediccion from "@/pages/Admin/GenerarPrediccion/index.jsx"
import GestionarUsuariosAll from "@/pages/Admin/GestionarUsuariosAll/index.jsx"
import GestionarPlanesSuscripcion from "@/pages/Admin/GestionarPlanesSuscripcion/index.jsx"
import RegistrarTienda from "@/pages/Admin/RegistrarTienda/index.jsx"

// Una página para rutas no encontradas
import NotFoundPage from "@/components/NotFoundPage.jsx";

const router = createBrowserRouter([
  // --- RUTAS PÚBLICAS ---
  // Estas rutas solo son accesibles si el usuario NO está autenticado.
  {
    path: "/",
    element: (
      <PublicRoute>
        <SaaSHomePage />
      </PublicRoute>
    ),
  },
  {
    path: "/saas-login",
    element: (
      <PublicRoute>
        <SaaSLogin />
      </PublicRoute>
    ),
  },
  {
    path: "/saas-register",
    element: (
      <PublicRoute>
        <SaaSRegister />
      </PublicRoute>
    ),
  },
  {
    // Esta página es especial: maneja la creación de la sesión,
    // por lo que no debe estar protegida por PublicRoute.
    path: "/saas-register/return",
    element: <ReturnStripe />,
  },

  // --- RUTAS PRIVADAS PARA ADMINISTRADORES / VENDEDORES ---
  // Protegidas por <ProtectedRoute>. Si no estás logueado, te redirige a /saas-login.
  // Si eres un 'cliente', también te redirige.
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <AdministrativeLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path:"profile",
        element:<EditProfile />
      },
      {
        path:"editstore",
        element:<EditStore />
      },
      {
        path:"bitacora/index",
        element:<Bitacora />
      },
      {
        path: "usuarios/tienda",
        children: [
          {
            index: true,
            element: <GestionarUsuariosTienda />,
          },
          {
            path: "nuevo",
            element: <CrearUsuarioTienda />,
          },
          {
            path: ":id",
            element: <EditarUsuarioTienda />,
          },
        ]
      },
      {
        path: "usuarios/clientes",
        children: [
          {
            index: true,
            element:<GestionarUsuariosClientes />
          },
          {
            path: "nuevo",
            element: <CrearUsuarioCliente />,
          },
          {
            path: ":id",
            element: <EditarUsuarioCliente />,
          },
        ]
      },
      {
        path:"comercial/marcas",
        children: [
          {
            index: true,
            element:<GestionarMarcaProductos />
          },
          {
            path: "nueva",
            element: <CrearMarca />,
          },
          {
            path: ":id",
            element: <EditarMarca />,
          },
        ]
      },
      {
        path:"comercial/categorias",
        children: [
          {
            index: true,
            element:<GestionarCategoriaProductos />
          },
          {
            path: "nueva",
            element: <CrearCategoria />,
          },
          {
            path: ":id",
            element: <EditarCategoria />,
          },
        ]
      },
      {
        path:"comercial/productos",
        children: [
          {
            index: true,
            element:<GestionarProductos />
          },
          {
            path: "nuevo",
            element: <CrearProducto />,
          },
          {
            path: ":id",
            element: <EditarProducto />,
          },
        ]
      },
      {
        path:"ventas/productos",
        element:<PagoProductos />
      },
      {
        path:"ventas/nota-venta",
        children: [
          {
            index: true,
            element:<GenerarNotaVenta />
          },
          {
            path: ":id",
            element: <EditarVenta />,
          },
        ]
      },
      {
        path:"ventas/historial-ventas",
        element:<HistorialVentas />
      },
      {
        path:"reporte/generar",
        element:<GenerarReportesVoz />
      },
      {
        path:"prediccion/generar",
        element:<GenerarPrediccion />
      },
      {
        path:"usuarios/all",
        element:<GestionarUsuariosAll />
      },
      {
        path:"saas/planes-suscripcion",
        element:<GestionarPlanesSuscripcion />
      },
      {
        path:"saas/registrar-tienda",
        element:<RegistrarTienda />
      },
    ],
  },

  // --- RUTAS PARA CLIENTES ---
  {
    path: "/perfil",
    element: 
        <ClientePerfil />
  },
  {
    path: "/historial-pagos",
    element: 
        <ClienteHistorialPagos />
  },
  {
    path: "/tiendas",
    element: 
        <StoreHomePage />
  },
  {
    path: "/tiendas/login",
    element: (
      <PublicRoute>
        <ClienteLogin />
      </PublicRoute>
    ),
  },
  {
    path: "/tiendas/register",
    element: (
      <PublicRoute>
        <ClienteRegister />
      </PublicRoute>
    ),
  },
  {
    path: "/tienda/:slug", 
    element: <StoreLayout />,
    children: [
      {
        index: true,
        element: <StoreProductsPage />
      },
      {
        path: "producto/:productId",
        element: <StoreProductDetail />
      },
      {
        path: "carrito",
        element: <StoreCart />
      },
      {
        path: "pagar",
        element: <StorePay />
      },
      {
        path: "pago-exitoso",
        element: <SuccessPay />
      },
    ],
  },

  //Atrapa cualquier otra ruta que no coincida.
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
