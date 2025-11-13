import { useState, useEffect, useRef } from 'react';

/**
 * Hook personalizado para detectar la inactividad del usuario.
 * @param {function} onIdle - Función a llamar cuando el usuario está inactivo.
 * @param {number} timeout - Tiempo en milisegundos para considerar "inactivo".
 */
export const useIdleTimer = (onIdle, timeout) => {
  const timerRef = useRef(null); // Almacena el ID del timer

  // 1. La función que resetea el timer
  const resetTimer = () => {
    // Limpia el timer anterior
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // Inicia un nuevo timer
    timerRef.current = setTimeout(onIdle, timeout);
  };

  // 2. useEffect para configurar los event listeners
  useEffect(() => {
    // Lista de eventos que cuentan como "actividad"
    const events = [
      'mousemove', // Mover el mouse
      'keydown',   // Presionar una tecla
      'click',     // Hacer clic
      'scroll',    // Hacer scroll
      'touchstart' // Tocar la pantalla (móvil)
    ];

    // Inicia el timer la primera vez
    resetTimer();

    // Añade los listeners a la ventana
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // 3. ¡La limpieza! (Esto es lo más importante)
    // Se ejecuta cuando el componente (AdministrativeLayout) se desmonta
    return () => {
      // Limpia el timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Remueve todos los listeners para evitar fugas de memoria
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [onIdle, timeout]); // Se vuelve a configurar si onIdle o timeout cambian

  // Este hook no necesita devolver nada, solo "escucha"
};