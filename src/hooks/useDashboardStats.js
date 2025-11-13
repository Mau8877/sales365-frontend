import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient'; // Asumo que tu apiClient está aquí

/**
 * Formatea un número como moneda (ej. $1,450)
 */
const formatCurrency = (value) => {
  if (value === null || value === undefined) value = 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Hook personalizado para obtener las estadísticas del Dashboard.
 */
export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    ventasHoy: "$0",
    ventasMes: "$0",
    ventasAnio: "$0",
    ticketPromedio: "$0",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // --- AQUÍ VA TU LLAMADA REAL A LA API ---
        // const response = await apiClient.get('/dashboard/kpis');
        // const data = response.data;
        
        // --- Simulación de API con 1.5 segundos ---
        await new Promise(resolve => setTimeout(resolve, 1500));
        const data = {
          ventas_hoy: 1450.75,
          ventas_mes: 28720.50,
          ventas_anio: 310900.00,
          ticket_promedio: 112.50,
        };
        // -----------------------------------------
        
        setStats({
          ventasHoy: formatCurrency(data.ventas_hoy),
          ventasMes: formatCurrency(data.ventas_mes),
          ventasAnio: formatCurrency(data.ventas_anio),
          ticketPromedio: formatCurrency(data.ticket_promedio),
        });

      } catch (err) {
        setError('Error al cargar las estadísticas.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []); // El array vacío [] asegura que solo se ejecute una vez

  return { stats, isLoading, error };
};