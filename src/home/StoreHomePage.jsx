import React, { useState, useEffect, useCallback } from 'react';
import Header from "./components/SaaS/layouts/Header";
import publicApiClient from "@/services/publicApiClient";
import StoreCard from '@/components/StoreCard';
import { Loader, Search, AlertCircle } from 'lucide-react';

const StoreHomePage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStores = useCallback(async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const params = { search: searchQuery };
      const response = await publicApiClient.get('/saas/public/tiendas/', { params });
      setStores(response.results || response || []);
    } catch (err) {
      console.error("Error fetching stores:", err);
      setError("No se pudieron cargar las tiendas. Inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores("");
  }, [fetchStores]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStores(searchTerm);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-red-600">
          <AlertCircle className="w-12 h-12" />
          <p className="mt-4 text-lg font-medium">{error}</p>
        </div>
      );
    }

    if (stores.length === 0) {
      return (
        <div className="text-center py-20">
          <h3 className="text-2xl font-semibold text-gray-700">No se encontraron tiendas</h3>
          <p className="text-gray-500 mt-2">Intenta con una búsqueda diferente.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Encuentra tu Tienda
          </h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Explora nuestro directorio de tiendas. Busca por nombre, rubro o descripción.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-lg mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar en SmartSales365..."
                className="w-full py-3 pl-12 pr-4 text-lg border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute left-4"
                aria-label="Buscar"
              >
                <Search className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </form>
        </div>

        <div className="mt-10">
          {renderContent()}
        </div>
        
      </div>
    </div>
  );
};

export default StoreHomePage;