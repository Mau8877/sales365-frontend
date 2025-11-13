import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, useParams, Link } from 'react-router-dom';
import publicApiClient from "@/services/publicApiClient";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { Loader, AlertCircle } from 'lucide-react';

const StoreDataContext = createContext(null);

function StoreLayout() {
  const { slug } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const response = await publicApiClient.get(`/saas/public/tiendas/${slug}/`);
        setStore(response);
      } catch (err) {
        console.error("Error fetching store data:", err);
        setError("No se pudo encontrar la tienda. ¿La dirección es correcta?");
      } finally {
        setLoading(false);
      }
    };
    fetchStoreData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-red-600">
        <AlertCircle className="w-16 h-16" />
        <p className="mt-4 text-xl font-medium">{error || "Tienda no encontrada."}</p>
        <Link to="/" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Volver al directorio
        </Link>
      </div>
    );
  }

  return (
    <StoreDataContext.Provider value={store}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <StoreHeader store={store} />
        
        <main className="container mx-auto p-4 md:p-6 lg:p-8 flex-grow">
          <Outlet />
        </main>

        <StoreFooter store={store} />
      </div>
    </StoreDataContext.Provider>
  );
}

export const useStoreData = () => {
  const context = useContext(StoreDataContext);
  if (!context) {
    throw new Error("useStoreData debe ser usado dentro de un StoreLayout");
  }
  return context;
};

export default StoreLayout;