import React, { useState } from 'react';
import { Edit, Power, Package, ChevronLeft, ChevronRight } from 'lucide-react'; 

function ProductCardIndex({
  product,
  onEdit,
  onDelete,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const sortedPhotos = [
    ...(product.fotos?.filter(f => f.principal) || []),
    ...(product.fotos?.filter(f => !f.principal) || [])
  ];

  const getMainImage = () => {
    if (!sortedPhotos || sortedPhotos.length === 0) {
      return (
        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500">
          <Package size={48} />
        </div>
      );
    }
    
    const imageUrl = sortedPhotos[currentImageIndex].foto;
    return (
      <img
        src={imageUrl}
        alt={product.nombre}
        className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300"
      />
    );
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === 0 ? sortedPhotos.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === sortedPhotos.length - 1 ? 0 : prev + 1
    );
  };
  
  const categoryNames = product.categorias.map(c => c.nombre).join(', ');

  const formatPrice = (value) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(value);
  };

  const isPublished = product.estado;
  const statusText = isPublished ? 'Publicado' : 'Oculto';
  const statusBgClass = isPublished ? 'bg-green-600' : 'bg-slate-500';

  const getStockClasses = (stock) => {
    if (stock > 10) return 'text-green-600 font-bold';
    if (stock > 0) return 'text-yellow-500 font-bold';
    return 'text-red-600 font-bold';
  };

  const handleEditClick = () => onEdit(product.id);
  const handleDeleteClick = () => onDelete(product.id, product.nombre);

  return (
    // ----- ¡CAMBIO AQUÍ! -----
    // Quité "w-72" y puse "w-full"
    <div className="w-full border border-slate-200 rounded-lg shadow-md bg-white flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg">
    {/* ----- FIN DEL CAMBIO ----- */}
      
      <div>
        <div className="w-full aspect-square relative bg-slate-100 group">
          <span
            className={`absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-bold text-white z-20 ${statusBgClass}`}
          >
            {statusText}
          </span>
          
          {getMainImage()}

          {sortedPhotos.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 bg-black bg-opacity-30 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 bg-black bg-opacity-30 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
              >
                <ChevronRight size={20} />
              </button>
              
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                {sortedPhotos.map((_, index) => (
                  <span
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-bold truncate" title={product.nombre}>
            {product.nombre}
          </h3>
          <p className="text-sm text-slate-600">
            {product.marca ? product.marca.nombre : 'Sin Marca'}
          </p>
          <p className="text-base font-semibold text-slate-800 mt-2">
            {formatPrice(product.precio)}
          </p>
        </div>

        <div className="px-4 pb-4 border-b border-slate-100 space-y-1">
          <div className="flex justify-between text-sm text-slate-700">
            <span>Stock:</span>
            <span className={getStockClasses(product.stock)}>
              {product.stock} unidades
            </span>
          </div>
          <div className="flex justify-between text-sm text-slate-700">
            <span className="flex-shrink-0 mr-2">Categorías:</span>
            <span className="font-medium text-right truncate" title={categoryNames}>
              {categoryNames || <span className="text-slate-400">N/A</span>}
            </span>
          </div>
          <div className="flex justify-between text-sm text-slate-700">
            <span>Código:</span>
            <span className="font-mono text-xs text-slate-500">
              {product.codigo_referencia || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex p-3 bg-slate-50 gap-2">
        <button 
          onClick={handleEditClick}
          className="flex-1 py-2 px-3 text-sm font-medium rounded-md border border-slate-300 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Edit size={16} />
          Editar
        </button>
        <button
          onClick={handleDeleteClick}
          className="flex-1 py-2 px-3 text-sm font-medium rounded-md border border-red-500 text-red-500 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Power size={16} />
          {isPublished ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </div>
  );
}

export default ProductCardIndex;