import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

import UniversalTable from '@/components/UniversalTable';
import StatusPill from "@/components/StatusPill";
import { useServerSideTable } from '@/hooks/useServerSideTable';
import apiClient from '@/services/apiClient';
import authService from "@/services/auth";
import { toast } from 'react-hot-toast';
import { AlertCircle, Edit } from 'lucide-react'; // 'FileText' eliminado

// --- Células Personalizadas ---

// Mapeo de colores para los estados
const getStatusType = (status) => {
  switch (status) {
    // --- ESTADOS VERDES (Activo / Terminado) ---
    case 'ENTREGADO':
    case 'COMPLETADO':
    case 'PROCESADA':
      return 'active';

    // --- ESTADOS AMARILLOS (En Progreso / Pendiente) ---
    case 'ENVIADA':
    case 'EN_PREPARACION':
    case 'EN_CAMINO':
    case 'PENDIENTE':
      return 'warning';

    // --- ESTADOS ROJOS/GRISES (Error / Cancelado) ---
    case 'CANCELADA':
    case 'FALLIDO':
    case 'REEMBOLSADO':
    case 'INCIDENCIA':
      return 'inactive';

    // --- Default (Si algo es nulo o nuevo) ---
    default:
      return 'neutral';
  }
};

// Célula para ID y Fecha
const VentaCell = ({ item }) => {
  let fechaFormateada = "Fecha no disponible";
  const formatoDeDjango = "yyyy-MM-dd HH:mm:ss xx";

  if (item.fecha_venta) {
    try {
      const fechaParseada = parse(
        item.fecha_venta, 
        formatoDeDjango, 
        new Date()
      );
      fechaFormateada = format(fechaParseada, "dd MMM yyyy, HH:mm 'hs'", { locale: es });
    } catch (error) {
      console.warn(`Error al parsear la fecha (formato personalizado): ${item.fecha_venta}`, error);
      fechaFormateada = "Fecha inválida";
    }
  }

  return (
    <div>
      <div className="font-medium text-gray-900">
        Venta #{item.id}
      </div>
      <div className="text-sm text-gray-500">
        {fechaFormateada}
      </div>
    </div>
  );
};

// Célula para Cliente
const ClienteCell = ({ item }) => (
  <div>
    <div className="font-medium text-gray-900">
      {item.cliente?.nombre_completo || "N/A"}
    </div>
    <div className="text-sm text-gray-500">
      {item.cliente?.email || "Sin Email"}
    </div>
  </div>
);

// Célula para Estados
const EstadosCell = ({ item }) => (
  <div className="grid grid-cols-3 gap-x-2 gap-y-1 items-start">
    <div className="flex flex-col">
      <span className="text-xs font-medium text-gray-500 mb-0.5">Venta</span>
      <StatusPill
        text={item.estado_display}
        type={getStatusType(item.estado)}
      />
    </div>
    <div className="flex flex-col">
      <span className="text-xs font-medium text-gray-500 mb-0.5">Pago</span>
      <StatusPill
        text={item.pagos?.[0]?.estado_display || "Sin Pago"}
        type={getStatusType(item.pagos?.[0]?.estado)}
      />
    </div>
    <div className="flex flex-col">
      <span className="text-xs font-medium text-gray-500 mb-0.5">Envío</span>
      <StatusPill
        text={item.envio?.estado_display || "Sin Envío"}
        type={getStatusType(item.envio?.estado)}
      />
    </div>
  </div>
);

// --- Componente Principal ---
const GenerarNotaVenta = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  
  const { 
    data: rawVentas,
    loading, 
    error, 
    pagination, 
    orderingState,
    handlePageChange, 
    handleSearchSubmit,
    handleSort,
    refreshData
  } = useServerSideTable('/ventas/admin-ventas/');
  
  const ventas = useMemo(() => {
    return rawVentas.map(venta => ({
      ...venta,
      id_flat: venta.id,
      cliente_nombre_flat: `${venta.cliente?.nombre_completo || ''}`,
      total_flat: venta.total,
      estado_flat: venta.estado_display,
    }));
  }, [rawVentas]);

  // --- Columnas de la Tabla ---
  const columns = useMemo(() => [
    { 
      header: "Venta", 
      accessor: "id_flat",
      render: (item) => <VentaCell item={item} />,
      sortKey: "fecha_venta"
    },
    { 
      header: "Cliente", 
      accessor: "cliente_nombre_flat",
      render: (item) => <ClienteCell item={item} />,
      sortKey: "cliente__user__profile__apellido"
    },
    { 
      header: "Total", 
      accessor: "total_flat",
      render: (item) => <span className="font-semibold text-gray-800">Bs. {item.total}</span>,
      sortKey: "total"
    },
    { 
      header: "Estados (Venta/Pago/Envío)", 
      accessor: "estado_flat",
      render: (item) => <EstadosCell item={item} />,
      sortKey: "estado"
    },
  ], []);

  // --- Handlers de Acciones ---

  const handleEdit = (venta) => {
    navigate(`/dashboard/ventas/nota-venta/${venta.id}`);
  };

  const handleCancelSale = async (venta) => {
    if (venta.estado === 'CANCELADA') {
      toast.error("Esta venta ya ha sido cancelada.");
      return;
    }
    
    if (window.confirm(`¿Estás seguro que quieres CANCELAR la Venta #${venta.id}? Esta acción no se puede deshacer.`)) {
      try {
        await apiClient.patch(`/ventas/admin-ventas/${venta.id}/`, { 
          estado: 'CANCELADA' 
        });
        toast.success("Venta cancelada exitosamente.");
        refreshData();
      } catch (error) {
        console.error("Error al cancelar la venta:", error);
        toast.error("Error al cancelar la venta: " + (error.detail || error.message));
      }
    }
  };

  const rowActions = (item) => [
    {
      label: "Ver / Editar",
      icon: Edit,
      onClick: () => handleEdit(item),
    },
    // Botón "Generar Nota" eliminado
    {
      label: "Cancelar Venta",
      icon: AlertCircle,
      onClick: () => handleCancelSale(item),
      className: "text-red-600 hover:bg-red-50",
      disabled: item.estado === 'CANCELADA' || item.estado === 'ENTREGADA', 
    }
  ];

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-700">Error al Cargar Ventas</h2>
        <p className="text-red-600 mt-2">{error.message || error}</p>
      </div>
    );
  }

  return (
    <UniversalTable
      title="Historial de Ventas de la Tienda"
      data={ventas}
      columns={columns}
      loading={loading}
      
      searchMode="manual"
      onSearchSubmit={handleSearchSubmit}
      searchPlaceholder="Buscar por ID, cliente, email, NIT..."
      
      pagination={pagination}
      onPageChange={handlePageChange}
      
      onSort={handleSort}
      orderingState={orderingState}
      
      // Botón principal de "Generar Nota" eliminado
      showAddButton={false} 
      
      getRowActions={rowActions}
      onRowClick={handleEdit}
      emptyMessage="No se encontraron ventas para esta tienda"
    />
  );
};

export default GenerarNotaVenta;