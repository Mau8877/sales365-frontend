import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/services/apiClient';

// Coincide con tu 'CustomPageNumberPagination' del backend
const PAGE_SIZE = 20; 

/**
 * Hook personalizado para manejar toda la lógica de una tabla
 * conectada a un endpoint de API paginado, con búsqueda y ordenamiento.
 * @param {string} endpoint - La URL de la API (ej. '/auditoria/bitacoras/').
 */
export const useServerSideTable = (endpoint) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Parámetros de la API
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordering, setOrdering] = useState(""); // Estado para el ordenamiento
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    startIndex: 0,
  });

  /**
   * Función centralizada para buscar datos en la API.
   * Es 'useCallback' para que sea estable y no cause re-renders innecesarios.
   */
  const fetchData = useCallback(async (page, search, currentOrdering) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('page_size', PAGE_SIZE);
      if (search) {
        params.append('search', search);
      }
      // Añade el parámetro de ordenamiento si existe
      if (currentOrdering) {
        params.append('ordering', currentOrdering);
      }

      // Llama al endpoint que le pasamos
      const response = await apiClient.get(`${endpoint}?${params.toString()}`);

      // Guarda los datos de 'results'
      setData(response.results);

      // Calcula y guarda la paginación
      const totalResults = response.count;
      const totalPages = Math.ceil(totalResults / PAGE_SIZE);
      const startIndex = (page - 1) * PAGE_SIZE;

      setPagination({
        currentPage: page,
        totalPages: totalPages,
        totalResults: totalResults,
        startIndex: startIndex,
      });

    } catch (err) {
      setError(`Error al cargar datos: ${err.detail || err.message || 'Error de red'}`);
    } finally {
      setLoading(false);
    }
  }, [endpoint]); // El 'endpoint' es la única dependencia real

  // Carga inicial
  useEffect(() => {
    fetchData(1, "", ""); // page=1, search="", ordering=""
  }, [fetchData]);

  // --- Handlers que devolveremos ---

  const handleSearchSubmit = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); 
    fetchData(1, newSearchTerm, ordering); // Llama con el orden actual
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchData(newPage, searchTerm, ordering); // Llama con el orden actual
  };

  // --- ¡NUEVO HANDLER DE ORDENAMIENTO! ---
  const handleSort = (sortKey) => {
    let newOrdering;
    if (ordering === sortKey) { // Si es A-Z
      newOrdering = `-${sortKey}`; // Cambia a Z-A
    } else if (ordering === `-${sortKey}`) { // Si es Z-A
      newOrdering = ""; // Quita el orden
    } else { // Si no tiene orden
      newOrdering = sortKey; // Pone A-Z
    }
    
    setOrdering(newOrdering);
    setCurrentPage(1); // Resetea a página 1
    fetchData(1, searchTerm, newOrdering); // Llama con el NUEVO orden
  };

  const refreshData = () => {
    fetchData(currentPage, searchTerm, ordering);
  };

  // Devolvemos todo lo que la tabla necesita
  return {
    data,
    loading,
    error,
    pagination,
    orderingState: ordering, // El estado actual del orden
    handlePageChange,
    handleSearchSubmit,
    handleSort, // El nuevo handler
    refreshData,
  };
};