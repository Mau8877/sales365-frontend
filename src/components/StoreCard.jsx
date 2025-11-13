import React from 'react';
import { Link } from 'react-router-dom';
import { Store } from 'lucide-react'; // Icono por si no hay logo

/**
 * Tarjeta para mostrar una tienda en el directorio público (StoreHomePage).
 * Redirige a /tienda/:slug al hacer clic.
 *
 * Esta versión espera que el backend (vía Cloudinary) ya entregue
 * imágenes pre-recortadas a 16:9 (banner) y 1:1 (logo).
 */
const StoreCard = ({ store }) => {
  // URL por defecto si la tienda no subió banner o la URL falla
  const defaultBanner = `https://placehold.co/600x300/e2e8f0/64748b?text=${encodeURIComponent(store.nombre)}`;
  const storeUrl = `/tienda/${store.slug}`;

  /**
   * Manejador de error para la imagen del banner.
   * Si la URL principal (store.banner_url) falla al cargar,
   * este evento se dispara y reemplaza el 'src' con el banner por defecto.
   */
  const handleBannerError = (e) => {
    // Evita bucles infinitos si el defaultBanner también falla
    if (e.target.src !== defaultBanner) {
      e.target.src = defaultBanner;
    }
  };

  return (
    <Link
      to={storeUrl}
      className="block w-full bg-white rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      title={`Visitar tienda ${store.nombre}`}
    >
      {/* --- SECCIÓN DE IMAGEN (BANNER) --- */}
      <div className="relative w-full aspect-video bg-slate-200">
        <img
          src={store.banner_url || defaultBanner}
          alt={`Banner de ${store.nombre}`}
          className="w-full h-full object-cover"
          onError={handleBannerError}
        />
        {/* Tal como descubriste, eliminamos la capa de superposición
            que estaba causando el problema. */}
      </div>

      {/* --- SECCIÓN DE INFORMACIÓN --- */}
      <div className="p-4 pt-0 relative">
        
        {/* --- LOGO SUPERPUESTO --- */}
        <div
          className="relative -mt-10 w-20 h-20 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center overflow-hidden"
        >
          {store.logo_url ? (
            <img
              src={store.logo_url}
              alt={`Logo de ${store.nombre}`}
              className="w-full h-full object-cover" // object-cover es perfecto aquí
            />
          ) : (
            <Store className="w-10 h-10 text-slate-400" />
          )}
        </div>

        {/* --- DATOS DE LA TIENDA --- */}
        <div className="pt-4">
          <h3 className="text-xl font-bold text-gray-900 truncate" title={store.nombre}>
            {store.nombre}
          </h3>
          <p className="text-sm text-blue-600 font-medium mt-1">
            {store.rubro || 'General'}
          </p>
          <p className="text-sm text-gray-600 mt-2 h-10 overflow-hidden text-ellipsis">
            {store.descripcion_corta || `Visita nuestra tienda para ver todos los productos.`}
          </p>
        </div>

        {/* --- BOTÓN/ACCIÓN --- */}
        <div className="mt-4">
          <span
            className="inline-block w-full text-center py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg group-hover:bg-blue-700 transition-colors"
          >
            Ver Tienda
          </span>
        </div>
      </div>
    </Link>
  );
};

export default StoreCard;