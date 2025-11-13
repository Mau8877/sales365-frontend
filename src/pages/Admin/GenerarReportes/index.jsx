import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBook,       // Icono para Bitácora
  FaUsers,      // Icono para Usuarios
  FaChartLine,  // Icono para Ventas
  FaBoxOpen     // Icono para Productos
} from 'react-icons/fa';

// Definimos las opciones de reportes en un array para que sea fácil de mantener
const reportOptions = [
  {
    name: 'Bitácora',
    icon: <FaBook className="text-5xl mb-4 text-blue-600" />,
    path: 'bitacora',
    description: 'Revisar logs y actividad del sistema.'
  },
  {
    name: 'Usuarios',
    icon: <FaUsers className="text-5xl mb-4 text-green-600" />,
    path: 'usuarios',
    description: 'Reportes de actividad y perfiles de usuarios.'
  },
  {
    name: 'Ventas',
    icon: <FaChartLine className="text-5xl mb-4 text-red-600" />,
    path: 'ventas',
    description: 'Analizar métricas de ventas e ingresos.'
  },
  {
    name: 'Productos',
    icon: <FaBoxOpen className="text-5xl mb-4 text-purple-600" />,
    path: 'productos',
    description: 'Gestionar inventario y popularidad de productos.'
  },
];

/**
 * Página principal (Dashboard) para seleccionar un tipo de reporte dinámico.
 */
const GenerarReportesDinamicos = () => {
  return (
    <div className="container mx-auto p-8">
      
      <h1 className="text-4xl font-bold mb-4 text-gray-800">
        Generador de Reportes
      </h1>
      <p className="text-lg text-gray-600 mb-10">
        Selecciona el módulo sobre el que deseas generar un reporte dinámico.
      </p>

      {/* Grid para las "casas" o tarjetas.
        - En móviles: 1 columna (grid-cols-1)
        - En tablets: 2 columnas (md:grid-cols-2)
        - En desktops: 4 columnas (lg:grid-cols-4)
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {reportOptions.map((option) => (
          <Link
            key={option.path}
            // Esta es la ruta dinámica que pediste
            to={`/dashboard/reporte-dinamico/generar/${option.path}`}
            className="group block"
          >
            {/* La tarjeta (casa) */}
            <div className="flex flex-col items-center justify-center p-10 h-64
                            bg-white rounded-xl shadow-lg 
                            border border-gray-200
                            transition-all duration-300 ease-in-out
                            hover:shadow-2xl hover:border-blue-500
                            transform hover:-translate-y-2">
              
              {/* El icono grande */}
              {option.icon}

              {/* El título */}
              <h2 className="text-2xl font-semibold text-gray-900">
                {option.name}
              </h2>
              
              {/* Pequeña descripción (opcional) */}
              <p className="text-gray-500 text-center text-sm mt-2">
                {option.description}
              </p>

            </div>
          </Link>
        ))}

      </div>
    </div>
  );
};

export default GenerarReportesDinamicos;