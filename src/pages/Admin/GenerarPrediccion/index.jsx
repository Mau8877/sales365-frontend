import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react'; // Re-usamos el ícono del menú

const GenerarPrediccion = () => {
  // Variantes de animación consistentes con el Dashboard
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Usamos una tarjeta blanca similar a las del Dashboard
        para mantener la consistencia visual.
      */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* Un pequeño encabezado para la página */}
        <div className="flex items-center gap-3 mb-4 border-b pb-4">
          <Users className="text-blue-700" size={28} />
          <h2 className="text-2xl font-semibold text-gray-900">
            Módulo: Gestionar Usuarios de Tienda
          </h2>
        </div>

        <p className="text-gray-600">
          Hola! Esta es la página para la gestión de usuarios (Administradores y Vendedores).
        </p>

        {/* Un 'placeholder' para el contenido futuro */}
        <div className="mt-6 p-6 bg-gray-50 rounded-lg border text-center">
          <h3 className="text-lg font-semibold text-gray-700">
            Próximamente: Tabla de Usuarios
          </h3>
          <p className="text-gray-500 mt-2">
            Aquí es donde construirás la tabla para ver, crear, editar y eliminar usuarios.
          </p>
        </div>

      </div>
    </motion.div>
  );
};

export default GenerarPrediccion;