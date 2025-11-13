import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useStoreData } from "@/layouts/StoreLayout";
import publicApiClient from "@/services/publicApiClient";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

const ProductCard = ({ producto, slug }) => {
  const fotoPrincipal =
    producto.fotos?.find((f) => f.principal)?.foto ||
    producto.fotos?.[0]?.foto ||
    null;

  return (
    <Link
      to={`/tienda/${slug}/producto/${producto.id}`}
      className="border rounded-lg overflow-hidden group flex flex-col bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
        {fotoPrincipal ? (
          <img
            src={fotoPrincipal}
            alt={producto.nombre}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-gray-400 text-sm">Sin imagen</span>
        )}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
          {producto.nombre}
        </h3>
        {producto.marca && (
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
            {producto.marca.nombre}
          </p>
        )}
        <div className="flex-grow" />
        <p className="text-green-600 font-bold text-lg mt-2">${producto.precio}</p>
      </div>
    </Link>
  );
};

const StoreProductsPage = () => {
  const store = useStoreData();
  const { slug } = useParams();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  const [filters, setFilters] = useState({
    search: "",
    ordering: "",
    categoria: null,
    marca: null,
  });
  
  const [searchTerm, setSearchTerm] = useState("");

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      if (key === "categoria") {
        newFilters.marca = null;
      }
      return newFilters;
    });
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterChange("search", searchTerm);
  };

  const handleSortChange = (e) => {
    handleFilterChange("ordering", e.target.value);
  };

  const clearFilter = (key) => {
    handleFilterChange(key, null);
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      ordering: "",
      categoria: null,
      marca: null,
    });
    setSearchTerm("");
  };

  useEffect(() => {
    if (!store.id) return;

    const fetchCategorias = async () => {
      try {
        const data = await publicApiClient.get(
          `/comercial/categorias/public-con-productos/?tienda=${store.id}`
        );
        setCategorias(data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };

    const fetchMarcas = async () => {
      try {
        const params = new URLSearchParams({ tienda: store.id });
        if (filters.categoria) {
          params.append("categoria_id", filters.categoria);
        }
        const data = await publicApiClient.get(
          `/comercial/marcas/public-con-productos/?${params.toString()}`
        );
        setMarcas(data);
      } catch (error) {
        console.error("Error al cargar marcas:", error);
      }
    };

    if (categorias.length === 0) {
      fetchCategorias();
    }
    fetchMarcas();
  }, [store.id, filters.categoria]);

  useEffect(() => {
    if (!store.id) return;

    setSearchTerm(filters.search);

    const fetchProductos = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          tienda: store.id,
        });

        if (filters.search) params.append("search", filters.search);
        if (filters.ordering) params.append("ordering", filters.ordering);
        if (filters.categoria) params.append("categorias", filters.categoria);
        if (filters.marca) params.append("marca", filters.marca);

        const data = await publicApiClient.get(
          `/comercial/productos/public-list/?${params.toString()}`
        );

        setProductos(data.results);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
        });
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [store.id, filters]);

  const handleLoadMore = async () => {
    if (!pagination.next || loadingMore) return;

    setLoadingMore(true);
    try {
      const data = await publicApiClient.get(pagination.next);

      setProductos((prev) => [...prev, ...data.results]);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
      });
    } catch (error) {
      console.error("Error al cargar más productos:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const hasActiveFilters = filters.search || filters.categoria || filters.marca;

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-6 px-4">
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <div className="sticky top-24 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Categorías</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => clearFilter("categoria")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      !filters.categoria
                        ? "bg-orange-100 text-orange-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Todas las Categorías
                  </button>
                </li>
                {categorias.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleFilterChange("categoria", cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center ${
                        filters.categoria === cat.id
                          ? "bg-orange-100 text-orange-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="truncate">{cat.nombre}</span>
                      <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full min-w-[20px] flex-shrink-0">
                        {cat.total_productos}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-gray-800">Marcas</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => clearFilter("marca")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      !filters.marca
                        ? "bg-orange-100 text-orange-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Todas las Marcas
                  </button>
                </li>
                {marcas.map((marca) => (
                  <li key={marca.id}>
                    <button
                      onClick={() => handleFilterChange("marca", marca.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center ${
                        filters.marca === marca.id
                          ? "bg-orange-100 text-orange-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="truncate">{marca.nombre}</span>
                      <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full min-w-[20px] flex-shrink-0">
                        {marca.total_productos}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <main className="w-full md:w-3/4 lg:w-4/5">
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-col md:flex-row gap-3 border">
            <form className="flex-grow flex gap-2" onSubmit={handleSearchSubmit}>
              <div className="relative flex-grow">
                <input
                  type="search"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="bg-orange-600 text-white px-6 py-2.5 rounded-xl hover:bg-orange-700 transition-colors font-medium whitespace-nowrap"
              >
                Buscar
              </button>
            </form>

            <div className="relative w-full md:w-auto md:min-w-[180px]">
              <select
                value={filters.ordering}
                onChange={handleSortChange}
                className="w-full appearance-none bg-white pl-3 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="">Ordenar por...</option>
                <option value="nombre">Nombre (A-Z)</option>
                <option value="-nombre">Nombre (Z-A)</option>
                <option value="precio">Precio (Menor a Mayor)</option>
                <option value="-precio">Precio (Mayor a Menor)</option>
              </select>
              <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="mb-4 flex gap-2 items-center flex-wrap min-h-[32px]">
            {filters.categoria &&
              categorias.find((c) => c.id === filters.categoria) && (
                <span className="flex items-center bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1.5 rounded-full">
                  {categorias.find((c) => c.id === filters.categoria).nombre}
                  <button
                    onClick={() => clearFilter("categoria")}
                    className="ml-1.5 hover:text-orange-900 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </span>
              )}
            {filters.marca && marcas.find((m) => m.id === filters.marca) && (
              <span className="flex items-center bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1.5 rounded-full">
                {marcas.find((m) => m.id === filters.marca).nombre}
                <button
                  onClick={() => clearFilter("marca")}
                  className="ml-1.5 hover:text-orange-900 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            )}
            {filters.search && (
              <span className="flex items-center bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1.5 rounded-full">
                "{filters.search}"
                <button
                  onClick={() => clearFilter("search")}
                  className="ml-1.5 hover:text-orange-900 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <ArrowPathIcon className="w-8 h-8 text-gray-500 animate-spin mx-auto" />
              <p className="text-gray-500 mt-3">Cargando productos...</p>
            </div>
          ) : productos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {productos.map((producto) => (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  slug={slug}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-500 mb-4">
                Intenta ajustar tu búsqueda o filtros.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="bg-orange-600 text-white px-6 py-2.5 rounded-xl hover:bg-orange-700 transition-colors font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            {pagination.next && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-orange-600 text-white px-8 py-3 rounded-xl hover:bg-orange-700 disabled:bg-gray-400 transition-colors flex items-center justify-center w-full sm:w-auto mx-auto font-medium"
              >
                {loadingMore ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
                    Cargando...
                  </>
                ) : (
                  "Cargar más productos"
                )}
              </button>
            )}

            {productos.length > 0 && (
              <p className="text-sm text-gray-600 mt-4">
                Mostrando {productos.length} de {pagination.count} productos
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StoreProductsPage;