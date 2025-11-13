import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCardIndex from '@/components/ProductCardIndex'; 
import { useServerSideTable } from '@/hooks/useServerSideTable';
import apiClient from '@/services/apiClient';

const PaginationControls = ({ pagination, onPageChange }) => {
  if (pagination.totalPages <= 1) return null;
  const handlePrev = () => { if (pagination.page > 1) onPageChange(pagination.page - 1); };
  const handleNext = () => { if (pagination.page < pagination.totalPages) onPageChange(pagination.page + 1); };
  return (
    <div className="flex items-center justify-between gap-4 mt-6">
      <span className="text-sm text-slate-600">Página {pagination.page} de {pagination.totalPages}</span>
      <div className="flex gap-2">
        <button onClick={handlePrev} disabled={pagination.page <= 1} className="flex items-center gap-1 px-3 py-1 border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronLeft size={16} /> Anterior
        </button>
        <button onClick={handleNext} disabled={pagination.page >= pagination.totalPages} className="flex items-center gap-1 px-3 py-1 border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Siguiente <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};


const GestionarProductos = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { 
    data: products,
    loading, 
    error, 
    pagination, 
    orderingState,
    handlePageChange, 
    handleSearchSubmit,
    handleSort,
    refreshData
  } = useServerSideTable('/comercial/productos/'); 

  const handleAdd = () => {
    navigate('/dashboard/comercial/productos/nuevo');
  };

  const handleEdit = (productId) => {
    navigate(`/dashboard/comercial/productos/${productId}`);
  };

  const handleToggleActive = async (productId, productName) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const actionText = product.estado ? "DESACTIVAR" : "ACTIVAR";
    
    if (window.confirm(`¿Estás seguro que quieres ${actionText} el producto "${productName}"?`)) {
      try {
        if (product.estado) {
          await apiClient.delete(`/comercial/productos/${productId}/`);
        } else {
          await apiClient.patch(`/comercial/productos/${productId}/`, { estado: true });
        }
        refreshData(); 
      } catch (error) {
        console.error(`Error al ${actionText.toLowerCase()} producto:`, error);
        alert(`Error al ${actionText.toLowerCase()} producto: ` + (error.detail || error.message));
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleSearchSubmit(searchTerm);
  };
  
  const handleSortChange = (e) => {
    handleSort(e.target.value);
  };

  const renderContent = () => {
    if (loading && products.length === 0) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin h-10 w-10 text-blue-700" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-red-800 font-semibold">Error al Cargar Productos</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      );
    }
    if (products.length === 0) {
      return (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-slate-700">No se encontraron productos</h3>
          <p className="text-slate-500 mt-1">Intenta ajustar tu búsqueda o crea un nuevo producto.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCardIndex
            key={product.id}
            product={product}
            onEdit={handleEdit}
            onDelete={handleToggleActive} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Gestionar Productos
          </h1>
          <p className="text-slate-600 mt-1">
            Administra, edita y visualiza tu inventario de productos.
          </p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus size={18} />
          Añadir Producto
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-grow flex gap-2">
          <label htmlFor="search-product" className="sr-only">Buscar</label>
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              id="search-product"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar por nombre, código..."
            />
          </div>
          <button
            type="submit"
            className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Buscar
          </button>
        </form>
        
        <div className="flex-shrink-0">
          <label htmlFor="sort-product" className="sr-only">Ordenar por</label>
          <select
            id="sort-product"
            onChange={handleSortChange}
            value={orderingState.key || 'nombre'} // Asegura un valor por defecto
            className="block w-full md:w-auto pl-3 pr-10 py-2 border border-slate-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="nombre">Ordenar por: Nombre (A-Z)</option>
            <option value="-nombre">Ordenar por: Nombre (Z-A)</option>
            <option value="precio">Ordenar por: Precio (Menor a Mayor)</option>
            <option value="-precio">Ordenar por: Precio (Mayor a Menor)</option>
            <option value="stock">Ordenar por: Stock (Bajo a Alto)</option>
            <option value="-stock">Ordenar por: Stock (Alto a Bajo)</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        {renderContent()}

        {!error && products.length > 0 && (
          <PaginationControls
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default GestionarProductos;