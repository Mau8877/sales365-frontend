import React from 'react';
import { motion } from 'framer-motion';

/**
 * Un interruptor de palanca (toggle) visual para estados activo/inactivo.
 */
const StatusToggle = ({ isActive, onToggle }) => {
  // Define los colores de nuestro sistema
  const activeColor = "bg-green-500"; // Verde para "Activo"
  const inactiveColor = "bg-red-500"; // Rojo para "Inactivo"

  // Variante de animación para el círculo (thumb)
  const thumbVariants = {
    active: { 
      x: "1.25rem", // Mueve el círculo 20px (w-5) a la derecha
      transition: { type: "spring", stiffness: 700, damping: 30 } 
    },
    inactive: { 
      x: 0,
      transition: { type: "spring", stiffness: 700, damping: 30 }
    }
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative flex items-center w-11 h-6 p-0.5 rounded-full transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 ${
        isActive ? activeColor : inactiveColor
      }`}
      aria-label={isActive ? "Desactivar usuario" : "Activar usuario"}
      role="switch"
      aria-checked={isActive}
    >
      {/* El círculo (thumb) que se desliza */}
      <motion.span
        className="block w-5 h-5 bg-white rounded-full shadow-md"
        variants={thumbVariants}
        animate={isActive ? "active" : "inactive"}
      />
    </button>
  );
};

export default StatusToggle;