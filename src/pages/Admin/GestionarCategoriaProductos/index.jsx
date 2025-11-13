import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UniversalTable from '@/components/UniversalTable';
import StatusPill from "@/components/StatusPill";
import { useServerSideTable } from '@/hooks/useServerSideTable';
import apiClient from '@/services/apiClient';
import authService from "@/services/auth";

const GestionarCategoriaProductos = () => {
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
  } = useServerSideTable('/comercial/categorias/');
  
  // Mapea los datos para aplanar 'estado'
  const data = useMemo(() => {
    return rawData.map(item => ({
      ...item,
      estado_texto: item.estado ? "Activo" : "Inactivo"
    }));
  }, [rawData]);

  // Definición de Columnas
  const columns = useMemo(() => [
    { 
      header: "ID", 
      accessor: "id",
      sortKey: "id"
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

  // Handlers de CRUD
  const handleAdd = () => {
    navigate('/dashboard/comercial/categorias/nueva');
  };

  const handleEdit = (item) => {
    navigate(`/dashboard/comercial/categorias/${item.id}`);
  };

  // Implementa el "Delete Lógico"
  const handleDeactivate = async (item) => {
    if (window.confirm(`¿Estás seguro que quieres DESACTIVAR la categoría ${item.nombre}?`)) {
      try {
        // Usamos el método DELETE que el backend interpreta como borrado lógico
        await apiClient.delete(`/comercial/categorias/${item.id}/`);
        refreshData(); // Recarga la tabla para mostrar el cambio
      } catch (error) {
        console.error("Error al desactivar categoría:", error);
        alert("Error al desactivar categoría: " + (error.detail || error.message));
      }
    }
  };

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold text-red-600">Error de Carga</h2>
        <p className="text-gray-700 mt-2">No se pudieron cargar las categorías.</p>
        <pre className="bg-gray-100 p-4 rounded-md mt-4 text-red-800 overflow-auto">
          {error}
        </pre>
      </div>
    );
  }

  return (
    <UniversalTable
      title="Tabla de Categorías"
      data={data}
      columns={columns}
      loading={loading}
      
      searchMode="manual"
      onSearchSubmit={handleSearchSubmit}
      pagination={pagination}
      onPageChange={handlePageChange}
      onSort={handleSort}
      orderingState={orderingState}
      
      // Pasamos el ID del usuario actual (si es necesario para permisos en el futuro)
      currentUserId={currentUser.user_id} 
      
      showAddButton={true}
      addButtonText="Agregar Categoría"
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDeactivate} // El botón de "borrar" ahora desactiva
      deleteButtonText="Desactivar"
      
      searchPlaceholder="Buscar por nombre..."
      emptyMessage="No se encontraron categorías"
    />
  );
};

export default GestionarCategoriaProductos;
