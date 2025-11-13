import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Mail, MapPin, ExternalLink, Store } from 'lucide-react';

const StoreFooter = ({ store }) => {
  const currentYear = new Date().getFullYear();

  const storeName = store?.nombre || 'Tienda';
  const storeLogo = store?.logo_url;
  const description = store?.descripcion_corta;
  const category = store?.rubro;

  return (
    <footer className="border-t border-gray-200 mt-12 bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Logo y nombre SOLO - sin descripción */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              {storeLogo ? (
                <img 
                  src={storeLogo} 
                  alt={`Logo de ${storeName}`}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => e.target.src = 'https://placehold.co/40x40/e2e8f0/64748b?text=L'}
                />
              ) : (
                <Store className="w-10 h-10 text-gray-400" />
              )}
              <h3 className="text-lg font-bold text-gray-900">{storeName}</h3>
            </div>
            {/* Quité la descripción de aquí */}
          </div>

          {/* Descripción en el centro */}
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-4">Sobre Nosotros</h4>
            <div className="space-y-2 text-sm text-gray-600">
              {description ? (
                <p className="italic">{description}</p>
              ) : (
                <p className="text-gray-500 italic">Tu tienda de confianza en SmartSales365</p>
              )}
              {category && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Store className="w-4 h-4" />
                  <span>Rubro: {category}</span>
                </div>
              )}
            </div>
          </div>

          {/* Enlaces */}
          <div className="text-center md:text-right">
            <h4 className="font-semibold text-gray-900 mb-4">Enlaces</h4>
            <div className="space-y-2 text-sm">
              <Link 
                to="/tiendas" 
                className="flex items-center justify-center md:justify-end gap-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span>Directorio de Tiendas</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link 
                to="/" 
                className="flex items-center justify-center md:justify-end gap-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span>Inicio SmartSales365</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} {storeName}. Todos los derechos reservados.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Potenciado por <span className="font-semibold text-blue-600">SmartSales365</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;