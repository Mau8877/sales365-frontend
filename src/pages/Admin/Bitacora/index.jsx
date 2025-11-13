import React, { useMemo } from 'react';
import UniversalTable from '@/components/UniversalTable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useServerSideTable } from '@/hooks/useServerSideTable';

// (UserCell y DateCell sin cambios)
const UserCell = ({ user }) => (
  <div className="flex items-center">
    <div>
      <div className="font-medium text-gray-900">
        {user?.profile?.nombre && user?.profile?.apellido
          ? `${user.profile.nombre} ${user.profile.apellido}`
          : (user?.email || "Usuario del Sistema")}
      </div>
      <div className="text-sm text-gray-500 capitalize">
        {user?.rol?.nombre || "Sin Rol"}
      </div>
    </div>
  </div>
);

const DateCell = ({ timestamp }) => {
  try {
    const date = new Date(timestamp);
    return format(date, "d MMM yyyy, p", { locale: es });
  } catch (error) {
    return "Fecha inválida";
  }
};

const Bitacora = () => {
  // Obtenemos todo del hook
  const { 
    data: rawData,
    loading, 
    error, 
    pagination, 
    orderingState,
    handlePageChange, 
    handleSearchSubmit,
    handleSort
  } = useServerSideTable('/auditoria/bitacoras/');
  
  // Aplanamos los datos para la búsqueda
  const data = useMemo(() => {
    return rawData.map(item => ({
      ...item,
      user_email: item.user?.email,
    }));
  }, [rawData]);

  // Definimos las columnas y sus 'sortKey'
  const columns = useMemo(() => [
    { 
      header: "Usuario", 
      accessor: "user_email", 
      render: (item) => <UserCell user={item.user} />,
      sortKey: "user__email"
    },
    { 
      header: "Acción", 
      accessor: "accion",
      sortKey: "accion"
    },
    { 
      header: "Objeto", 
      accessor: "objeto" 
    },
    { 
      header: "Fecha y Hora", 
      accessor: "timestamp", 
      render: (item) => <DateCell timestamp={item.timestamp} />,
      sortKey: "timestamp"
    },
    { 
      header: "IP", 
      accessor: "ip",
      sortKey: "ip"
    },
  ], []);

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold text-red-600">Error de Carga</h2>
        <p className="text-gray-700 mt-2">No se pudieron cargar los datos de la bitácora.</p>
        <pre className="bg-gray-100 p-4 rounded-md mt-4 text-red-800 overflow-auto">
          {error}
        </pre>
      </div>
    );
  }

  return (
    <UniversalTable
      title="Tabla Bitácora del Sistema"
      data={data}
      columns={columns}
      loading={loading}
      
      searchMode="manual"
      onSearchSubmit={handleSearchSubmit}
      pagination={pagination}
      onPageChange={handlePageChange}
      onSort={handleSort}
      orderingState={orderingState}
      
      showAddButton={false}
      
      searchPlaceholder="Buscar por email, acción, objeto, IP..."
      emptyMessage="No hay registros en la bitácora"
    />
  );
};

export default Bitacora;