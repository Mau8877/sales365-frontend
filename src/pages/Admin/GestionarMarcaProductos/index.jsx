import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UniversalTable from '@/components/UniversalTable';
import StatusPill from "@/components/StatusPill";
import { useServerSideTable } from '@/hooks/useServerSideTable';
import apiClient from '@/services/apiClient';
import authService from "@/services/auth";

/**
 * Página principal para gestionar las Marcas.
 * Utiliza una tabla con paginación, filtros y ordenamiento del lado del servidor.
 */
const GestionarMarcaProductos = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const { 
    data: rawData,
    loading, 
    error, 
    pagination, 
    orderingState,
    handlePageChange, 
    handleSearchSubmit,
    handleSort,
    refreshData
  } = useServerSideTable(
    '/comercial/marcas/', // Endpoint de la API para marcas
    {}
  );
  
  // Mapeamos los datos para la tabla
  const data = useMemo(() => {
    return rawData.map(marca => ({
      ...marca,
      // Convertimos el booleano 'estado' en texto legible
      estado_texto: marca.estado ? "Activo" : "Desactivado"
    }));
  }, [rawData]);

  // Definimos las columnas para la UniversalTable
  const columns = useMemo(() => [
    { 
      header: "ID", 
      accessor: "id",
    },
    { 
      header: "Nombre", 
      accessor: "nombre", 
      sortKey: "nombre"
    },
    { 
      header: "Descripción", 
      accessor: "descripcion",
      render: (item) => item.descripcion || <span className="text-gray-400">N/A</span>
    },
    { 
      header: "Estado", 
      accessor: "estado_texto",
      render: (item) => (
        <StatusPill
          text={item.estado_texto}
          type={item.estado ? 'active' : 'inactive'}
        />
      ),
      sortKey: "estado"
    },
  ], []);

  // --- Handlers de CRUD ---

  const handleAdd = () => {
    // Navegamos al formulario de creación
    navigate('/dashboard/comercial/marcas/nueva');
  };

  const handleEdit = (marca) => {
    // Navegamos al formulario de edición
    navigate(`/dashboard/comercial/marcas/${marca.id}`);
  };

  const handleDelete = async (marca) => {
    // Usamos 'estado: false' en lugar de un borrado físico
    const accion = marca.estado ? "DESACTIVAR" : "ACTIVAR";
    const nuevoEstado = !marca.estado;

    if (window.confirm(`¿Estás seguro que quieres ${accion} la marca "${marca.nombre}"?`)) {
      try {
        await apiClient.patch(`/comercial/marcas/${marca.id}/`, { estado: nuevoEstado });
        refreshData(); // Recarga la tabla
      } catch (error) {
        console.error(`Error al ${accion.toLowerCase()} marca:`, error);
        alert(`Error al ${accion.toLowerCase()} la marca: ` + (error.detail || error.message));
      }
    }
  };

  // Renderizado de error (copiado de tu ejemplo)
  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold text-red-600">Error de Carga</h2>
        <p className="text-gray-700 mt-2">No se pudieron cargar las marcas.</p>
        <pre className="bg-gray-100 p-4 rounded-md mt-4 text-red-800 overflow-auto">
          {error}
        </pre>
      </div>
    );
  }

  // Renderizado de la tabla
  return (
    <UniversalTable
      title="Tabla de Marcas"
      data={data}
      columns={columns}
      loading={loading}
      
      // Búsqueda
      searchMode="manual"
      onSearchSubmit={handleSearchSubmit}
      searchPlaceholder="Buscar por nombre..."
      
      // Paginación
      pagination={pagination}
      onPageChange={handlePageChange}
      
      // Ordenamiento
      onSort={handleSort}
      orderingState={orderingState}
      
      // Acciones CRUD
      showAddButton={true}
      addButtonText="Agregar Marca"
      onAdd={handleAdd}
      onEdit={handleEdit}
      
      // Cambiamos el texto del botón de "Delete"
      onDelete={handleDelete}
      deleteButtonText={(item) => item.estado ? "Desactivar" : "Activar"}
      deleteButtonColorClass={(item) => item.estado ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}

      emptyMessage="No se encontraron marcas"
    />
  );
};

export default GestionarMarcaProductos;

