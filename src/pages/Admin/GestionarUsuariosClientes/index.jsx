import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UniversalTable from '@/components/UniversalTable';
import StatusPill from "@/components/StatusPill";
import { useServerSideTable } from '@/hooks/useServerSideTable';
import apiClient from '@/services/apiClient';
import authService from "@/services/auth";

// --- Célula de Cliente ---
// Muestra el nombre y el correo del cliente
const ClienteCell = ({ item }) => (
  <div>
    <div className="font-medium text-gray-900">
      {item.profile?.nombre || 'Sin'} {item.profile?.apellido || 'Nombre'}
    </div>
    <div className="text-sm text-gray-500">
      {item.email || "Sin Email"}
    </div>
  </div>
);

const GestionarUsuariosClientes = () => {
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
    '/usuarios/users/customers/',
    { 'rol__nombre__in': 'cliente' } 
  );
  
  // Mapeamos los datos para aplanar la info del cliente
  const data = useMemo(() => {
    return rawData.map(user => ({
      ...user,
      nombre_completo: `${user.profile?.nombre || ''} ${user.profile?.apellido || ''}`.trim(),
      // Campos del profile
      telefono: user.profile?.telefono || '', 
      // Campos del cliente_profile_data
      nit: user.cliente_profile_data?.nit || '',
      razon_social: user.cliente_profile_data?.razon_social || '',
      // Estado
      estado_texto: user.is_active ? "Activo" : "Desactivado"
    }));
  }, [rawData]);

  // --- Columnas Adaptadas para Clientes ---
  const columns = useMemo(() => [
    { 
      header: "ID", 
      accessor: "id_usuario",
    },
    { 
      header: "Cliente", 
      accessor: "nombre_completo", 
      render: (item) => <ClienteCell item={item} />,
      sortKey: "profile__apellido"
    },
    {
      header: "Teléfono",
      accessor: "telefono",
      render: (item) => item.telefono || <span className="text-gray-400">N/A</span>,
      sortKey: "profile__telefono" 
    },
    {
      header: "NIT",
      accessor: "nit",
      render: (item) => item.nit || <span className="text-gray-400">N/A</span>,
      // Nota: El backend (UserViewSet) no soporta ordenar por nit,
      // pero tu ClienteViewSet sí. Si usamos UserViewSet, quitamos el sortKey.
      // sortKey: "cliente_profile__nit" 
    },
    {
      header: "Razón Social",
      accessor: "razon_social",
      render: (item) => item.razon_social || <span className="text-gray-400">N/A</span>,
      // sortKey: "cliente_profile__razon_social"
    },
    { 
      header: "Estado", 
      accessor: "estado_texto",
      render: (item) => (
        <StatusPill
          text={item.estado_texto}
          type={item.is_active ? 'active' : 'inactive'}
        />
       ),
        sortKey: "is_active"
    },
  ], []);

  // --- Handlers de CRUD (Rutas actualizadas) ---
  const handleAdd = () => {
    navigate('/dashboard/usuarios/clientes/nuevo');
  };

  const handleEdit = (user) => {
    // Un admin/vendedor no debería ser cliente, así que quitamos la autoprotección
    navigate(`/dashboard/usuarios/clientes/${user.id_usuario}`);
  };

  const handleDeactivate = async (user) => {
    if (user.id_usuario === currentUser.user_id) {
      alert("No puedes desactivarte a ti mismo desde esta vista.");
      return;
    }
    
    if (window.confirm(`¿Estás seguro que quieres DESACTIVAR a ${user.nombre_completo || user.email}? Esto desactivará su cuenta por completo.`)) {
      try {
        await apiClient.patch(`/usuarios/users/${user.id_usuario}/`, { is_active: false });
        refreshData();
      } catch (error) {
        console.error("Error al desactivar cliente:", error);
        alert("Error al desactivar cliente: " + (error.detail || error.message));
      }
    }
  };

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold text-red-600">Error de Carga</h2>
        <p className="text-gray-700 mt-2">No se pudieron cargar los clientes de la tienda.</p>
        <pre className="bg-gray-100 p-4 rounded-md mt-4 text-red-800 overflow-auto">
          {error}
        </pre>
      </div>
    );
  }

  return (
    <UniversalTable
      title="Gestión de Clientes de la Tienda"
      data={data}
      columns={columns}
      loading={loading}
      
      searchMode="manual"
      onSearchSubmit={handleSearchSubmit}
      pagination={pagination}
      onPageChange={handlePageChange}
      onSort={handleSort}
      orderingState={orderingState}
      
      currentUserId={currentUser.user_id}
      
      showAddButton={true}
      addButtonText="Agregar Cliente"
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDeactivate}
      
      searchPlaceholder="Buscar por nombre, email, nit..."
      emptyMessage="No se encontraron clientes"
    />
  );
};

export default GestionarUsuariosClientes;