import React from 'react';

/**
 * Componente StatusPill actualizado con todos los tipos de estado.
 */
const StatusPill = ({ text, type = 'neutral' }) => {
  let styles = '';

  // Asigna un color de Tailwind basado en el 'type'
  switch (type) {
    
    // Verde (Ej: Completado, Entregada)
    case 'active':
      styles = 'bg-green-100 text-green-800';
      break;
    
    // Amarillo/Naranja (Ej: Procesada, Pendiente, En Camino)
    case 'warning':
      styles = 'bg-yellow-100 text-yellow-800';
      break;
    
    // Rojo (Ej: Cancelada, Fallido)
    case 'inactive':
      styles = 'bg-red-100 text-red-800';
      break;

    // Azul (Opcional, si lo usas)
    case 'processing':
      styles = 'bg-blue-100 text-blue-800';
      break;
    
    // Gris (Default, Sin Pago, etc.)
    case 'neutral':
    default:
      styles = 'bg-gray-100 text-gray-700';
  }

  return (
    <span 
      className={`
        px-2.5 py-0.5 rounded-full text-xs font-medium 
        inline-block whitespace-nowrap w-full text-center
        ${styles}
      `}
    >
      {text || 'N/A'}
    </span>
  );
};

export default StatusPill;