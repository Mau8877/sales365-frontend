import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UniversalTable from '@/components/UniversalTable';
import StatusPill from "@/components/StatusPill";
import { useServerSideTable } from '@/hooks/useServerSideTable';
import apiClient from '@/services/apiClient';
import authService from "@/services/auth";

// (UserCell sin cambios)
const UserCell = ({ item }) => (
  <div>
    <div className="font-medium text-gray-900">
      {item.profile?.nombre || 'Sin'} {item.profile?.apellido || 'Nombre'}
    </div>
    <div className="text-sm text-gray-500 capitalize">
      {item.rol?.nombre || "Sin Rol"}
    </div>
  </div>
);

const GestionarUsuariosTienda = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  console.log(currentUser);
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
    '/usuarios/users/staff/',
    { 'rol__nombre__in': 'admin,vendedor' }
  );
  
  // --- ¡ACTUALIZAMOS EL MAPEADOR DE DATOS! ---
  const data = useMemo(() => {
    return rawData.map(user => ({
      ...user,
      nombre_completo: `${user.profile?.nombre || ''} ${user.profile?.apellido || ''}`.trim(),
      rol_nombre: user.rol?.nombre,
      // --- ¡NUEVO CAMPO APLANADO! ---
      telefono: user.profile?.telefono || '', 
      estado_texto: user.is_active ? "Activo" : "Desactivado"
    }));
  }, [rawData]);

  // --- ¡COLUMNAS ACTUALIZADAS! ---
  const columns = useMemo(() => [
    // --- NUEVA COLUMNA: ID ---
    { 
      header: "ID", 
      accessor: "id_usuario",
      // Es recomendable darle un ancho menor si tu tabla lo permite
    },
    { 
      header: "Nombre", 
      accessor: "nombre_completo", 
      render: (item) => <UserCell item={item} />,
      sortKey: "profile__apellido"
    },
    { 
      header: "Email", // "Correo" en tu petición
      accessor: "email",
      sortKey: "email"
    },
    // --- NUEVA COLUMNA: TELÉFONO ---
    {
      header: "Teléfono",
      accessor: "telefono", // Usamos el campo aplanado
      render: (item) => item.telefono || <span className="text-gray-400">N/A</span>,
      // Nota: El sortKey "profile__telefono" debe estar habilitado en el backend
      sortKey: "profile__telefono" 
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
        sortKey: "is_active" // <-- Habilitar 'is_active' en ordering_fields del backend
    },
  ], []);

  // --- Handlers de CRUD ---
  const handleAdd = () => {
    navigate('/dashboard/usuarios/tienda/nuevo');
  };

  // --- ¡HANDLE EDIT CON LÓGICA DE PERFIL! ---
  const handleEdit = (user) => {
    if (user.id_usuario === currentUser.user_id) {
      // Si es mi propia cuenta, voy a /profile
      navigate('/dashboard/profile');
    } else {
      // Si es otro usuario, voy a la página de edición
      navigate(`/dashboard/usuarios/tienda/${user.id_usuario}`);
    }
  };

  // --- ¡HANDLE DELETE AHORA ES SOFT DELETE! ---
  const handleDeactivate = async (user) => {
    // La autoprotección ya está en el botón, pero una doble comprobación no hace daño
    if (user.id_usuario === currentUser.user_id) {
      alert("No puedes desactivarte a ti mismo.");
      return;
    }
    
    if (window.confirm(`¿Estás seguro que quieres DESACTIVAR a ${user.nombre_completo || user.email}?`)) {
      try {
        await apiClient.patch(`/usuarios/users/${user.id_usuario}/`, { is_active: false });
        refreshData(); // Recarga la tabla para mostrar el cambio
      } catch (error) {
        console.error("Error al desactivar usuario:", error);
        alert("Error al desactivar usuario: " + (error.detail || error.message));
      }
    }
  };

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold text-red-600">Error de Carga</h2>
        <p className="text-gray-700 mt-2">No se pudieron cargar los usuarios.</p>
        <pre className="bg-gray-100 p-4 rounded-md mt-4 text-red-800 overflow-auto">
          {error}
        </pre>
      </div>
    );
  }

  return (
    <UniversalTable
      title="Gestión de Usuarios de Tienda"
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
      addButtonText="Agregar Usuario"
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDeactivate}
      
      searchPlaceholder="Buscar por nombre, email..."
      emptyMessage="No se encontraron usuarios"
    />
  );
};

export default GestionarUsuariosTienda;