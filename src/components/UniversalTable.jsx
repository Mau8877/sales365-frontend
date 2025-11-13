import React, { useState } from "react";
import { Plus, Edit, Trash2, Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

// (Helper 'getPaginationButtons' - sin cambios)
const getPaginationButtons = (currentPage, totalPages, maxButtons = 5) => {
  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const buttons = [];
  const half = Math.floor(maxButtons / 2);
  let start = currentPage - half;
  let end = currentPage + half;
  if (start < 1) {
    start = 1;
    end = maxButtons;
  }
  if (end > totalPages) {
    end = totalPages;
    start = totalPages - maxButtons + 1;
  }
  if (start > 1) {
    buttons.push(1);
    if (start > 2) buttons.push('...');
  }
  for (let i = start; i <= end; i++) {
    buttons.push(i);
  }
  if (end < totalPages) {
    if (end < totalPages - 1) buttons.push('...');
    buttons.push(totalPages);
  }
  return buttons;
};

// (Helper 'SortIcon' - sin cambios)
const SortIcon = ({ sortKey, orderingState }) => {
  if (orderingState === sortKey) return <ChevronDown size={14} className="ml-1" />;
  if (orderingState === `-${sortKey}`) return <ChevronUp size={14} className="ml-1" />;
  return <ChevronsUpDown size={14} className="ml-1 text-gray-400" />;
};

const UniversalTable = ({
  title,
  data = [],
  columns = [],
  onAdd,
  onEdit,
  onDelete,
  loading = false,
  searchPlaceholder = "Buscar...",
  addButtonText = "Agregar",
  showAddButton = true,
  emptyMessage = "No hay datos disponibles",
  
  searchMode = "auto",
  onSearchSubmit,
  pagination,
  onPageChange,
  
  onSort,
  orderingState,
  
  // --- ¡NUEVA PROP DE AUTOPROTECCIÓN! ---
  currentUserId = null,
  onRowClick,
}) => {
  
  // (Lógica de estado y paginación - sin cambios)
  const [localSearchInput, setLocalSearchInput] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientCurrentPage, setClientCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const isServerPaginated = !!(pagination && onPageChange);
  const isManualSearch = searchMode === "manual" && !!onSearchSubmit;
  const filteredData = React.useMemo(() => {
    if (isServerPaginated) return data; 
    return data.filter((item) =>
      columns.some((column) => {
        const value = column.accessor ? item[column.accessor] : null;
        return String(value ?? "").toLowerCase().includes(clientSearchTerm.toLowerCase());
      })
    );
  }, [data, columns, clientSearchTerm, isServerPaginated]);
  const totalClientPages = Math.ceil(filteredData.length / itemsPerPage);
  const clientStartIndex = (clientCurrentPage - 1) * itemsPerPage;
  const paginatedData = !isServerPaginated ? filteredData.slice(clientStartIndex, clientStartIndex + itemsPerPage) : data;
  const currentPage = isServerPaginated ? pagination.currentPage : clientCurrentPage;
  const totalPages = isServerPaginated ? pagination.totalPages : totalClientPages;
  const totalResults = isServerPaginated ? pagination.totalResults : filteredData.length;
  const currentData = paginatedData; 
  const showActions = onEdit || onDelete;
  const clientShowPagination = !isServerPaginated && (totalClientPages > 1);
  const serverShowPagination = isServerPaginated && (totalPages > 1);
  const handleSearchInputChange = (e) => {
    if (isManualSearch) setLocalSearchInput(e.target.value);
    else {
      setClientSearchTerm(e.target.value);
      setClientCurrentPage(1);
    }
  };
  const handleSearchSubmit = () => {
    if (isManualSearch) onSearchSubmit(localSearchInput);
  };
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    if (isServerPaginated) onPageChange(newPage);
    else setClientCurrentPage(newPage);
  };
  const paginationButtons = getPaginationButtons(currentPage, totalPages);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-6 flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-700 border-opacity-50"></div>
          <span className="ml-4 text-blue-700 font-semibold animate-pulse">
            Cargando...
          </span>
        </div>
      );
    }
    if (currentData.length === 0) {
      return (
        <div className="p-6 text-center py-12 text-gray-500 text-base">
          {clientSearchTerm || localSearchInput ? "No se encontraron resultados" : emptyMessage}
        </div>
      );
    }

    return (
      <>
        {/* --- Tabla Desktop --- */}
        <div className="hidden lg:block">
          <table className="w-full"> {/* Volvemos a w-full para que el texto se parta */}
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.accessor || index}
                    className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider" 
                  >
                    {column.sortKey && onSort ? (
                      <button 
                        onClick={() => onSort(column.sortKey)}
                        className="flex items-center gap-1 hover:text-gray-800 transition-colors"
                      >
                        {column.header}
                        <SortIcon sortKey={column.sortKey} orderingState={orderingState} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
                {showActions && (
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-32">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentData.map((item) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-blue-50 transition ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick ? onRowClick(item) : null}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-4 py-3 text-sm text-gray-900">
                      {column.render ? column.render(item) : item[column.accessor]}
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <button onClick={() => onEdit(item)} className="text-blue-700 hover:text-blue-900 p-2 rounded-full hover:bg-blue-100 transition-colors" title="Editar">
                            <Edit size={16} />
                          </button>
                        )}
                        {onDelete && (
                          // --- ¡CORRECCIÓN DE AUTOPROTECCIÓN! ---
                          <button
                            onClick={() => onDelete(item)}
                            // Deshabilitado si el ID del item es el ID del usuario actual
                            disabled={item.id_usuario === currentUserId}
                            className={`p-2 rounded-full transition-colors ${
                              item.id_usuario === currentUserId
                                ? "text-gray-400 opacity-50 cursor-not-allowed"
                                : "text-red-600 hover:text-red-900 hover:bg-red-100"
                            }`}
                            title={item.id_usuario === currentUserId ? "No puedes desactivarte a ti mismo" : "Desactivar Usuario"}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- Cards Móvil --- */}
        <div className="block lg:hidden space-y-4 p-6">
          {currentData.map((item) => (
            <div 
              key={item.id} 
              className={`border border-gray-200 rounded-lg p-4 bg-white shadow-sm ${onRowClick ? 'cursor-pointer hover:bg-blue-50 transition' : ''}`}
              onClick={() => onRowClick ? onRowClick(item) : null}
            >
              <div className="space-y-3">
                {columns.map((column, colIndex) => (
                  <div key={colIndex} className="flex justify-between items-start">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {column.header}:
                    </span>
                    <span className="text-sm text-gray-900 text-right ml-2">
                      {column.render ? column.render(item) : item[column.accessor] || "—"}
                    </span>
                  </div>
                ))}
                {showActions && (
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    {onEdit && (
                      <button onClick={() => onEdit(item)} className="flex items-center gap-1 text-blue-700 hover:text-blue-900 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                        <Edit size={16} />
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      // --- ¡CORRECCIÓN DE AUTOPROTECCIÓN (MÓVIL)! ---
                      <button
                        onClick={() => onDelete(item)}
                        disabled={item.id_usuario === currentUserId}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                          item.id_usuario === currentUserId
                            ? "text-gray-400 opacity-50 cursor-not-allowed"
                            : "text-red-600 hover:text-red-900 hover:bg-red-50"
                        }`}
                      >
                        <Trash2 size={16} />
                        Desactivar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      
      {/* Header (restaurado) */}
      <div className="border-b border-gray-200 px-6 py-4 bg-white rounded-t-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {isManualSearch ? (
              <div className="flex gap-2 flex-1 lg:flex-initial lg:w-80">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={localSearchInput}
                  onChange={handleSearchInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-blue-700 w-full transition"
                />
                <button
                  onClick={handleSearchSubmit}
                  className="flex items-center justify-center p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
                  aria-label="Buscar"
                >
                  <Search size={18} />
                </button>
              </div>
            ) : (
              <div className="relative flex-1 lg:flex-initial lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={clientSearchTerm}
                  onChange={handleSearchInputChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-blue-700 w-full transition"
                />
              </div>
            )}
            {showAddButton && (
              <button
                onClick={onAdd}
                className="flex items-center justify-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors font-semibold shadow-sm whitespace-nowrap"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">{addButtonText}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Padding movido a los hijos de renderContent */}
      <div>{renderContent()}</div>

      {/* Paginación (sin cambios) */}
      {(clientShowPagination || serverShowPagination) && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700 text-center sm:text-left">
              Mostrando <span className="font-bold">{isServerPaginated ? (pagination.startIndex + 1) : (clientStartIndex + 1)}</span> a{" "}
              <span className="font-bold">
                {isServerPaginated ? (pagination.startIndex + currentData.length) : (clientStartIndex + paginatedData.length)}
              </span>{" "}
              de <span className="font-bold">{totalResults}</span>{" "}
              resultados
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-blue-50 transition disabled:opacity-50"
              >
                Anterior
              </button>
              {paginationButtons.map((page, index) =>
                typeof page === 'number' ? (
                  <button
                    key={index}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      currentPage === page
                        ? "bg-blue-700 text-white"
                        : "bg-white border border-gray-300 text-gray-500 hover:bg-blue-50"
                    }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={index} className="px-3 py-2 text-sm text-gray-500">
                    ...
                  </span>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-blue-50 transition disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="text-sm text-gray-700 hidden md:block">
              Página <span className="font-bold">{currentPage}</span> de <span className="font-bold">{totalPages}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalTable;