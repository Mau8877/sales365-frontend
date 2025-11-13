import React, { useState, useEffect, useRef } from "react";
import apiClient from "@/services/apiClient";
import {
  AlertCircle,
  CheckCircle, 
  Store,
  Image,         
  UploadCloud,
  Loader,
} from "lucide-react";

// --- COMPONENTE DE ALERTA) ---
const Alert = ({ type, message }) => {
  if (!message) return null;
  const styles = {
    success: {
      bg: "bg-green-100",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      text: "text-green-800",
    },
    error: {
      bg: "bg-red-100",
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      text: "text-red-800",
    },
  };
  const s = styles[type] || styles.error;
  return (
    <div className={`${s.bg} rounded-md p-3 my-4`}>
      <div className="flex">
        <div className="flex-shrink-0">{s.icon}</div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${s.text}`}>{message}</p>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTES DE FORMULARIO ---
const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  autoComplete = "off",
  disabled = false,
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value || ""}
      onChange={onChange}
      autoComplete={autoComplete}
      placeholder={placeholder}
      disabled={disabled}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
    />
  </div>
);

const FormTextarea = ({ label, name, value, onChange, placeholder = "", disabled = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <textarea
      name={name}
      id={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      disabled={disabled}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
    />
  </div>
);

// --- COMPONENTE DE SUBIDA DE IMAGEN ---
const ImageUploader = ({
  label,
  previewUrl,
  defaultSrc,
  onFileChange,
  inputRef,
  aspectClass,
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <div
      className={`relative w-full ${aspectClass} rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-500 transition-all cursor-pointer overflow-hidden`}
      onClick={() => inputRef.current.click()}
    >
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={onFileChange}
        ref={inputRef}
        className="hidden"
      />
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={`${label} preview`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center">
          <UploadCloud className="h-10 w-10" />
          <span className="mt-2 text-sm">Haz clic para subir</span>
        </div>
      )}
      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
        <span className="text-white font-medium">Cambiar</span>
      </div>
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL (REFACTORIZADO) ---
const EditStore = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [globalMessage, setGlobalMessage] = useState({ type: "", text: "" });

  const [detailsData, setDetailsData] = useState({
    nombre: "",
    slug: "",
    rubro: "",
    descripcion_corta: "",
  });

  const [selectedLogo, setSelectedLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setPageLoading(true);
        const response = await apiClient.get("/saas/tiendas/");
        
        if (response.results && response.results.length > 0) {
          const myStore = response.results[0];
          setStoreId(myStore.id);
          setDetailsData({
            nombre: myStore.nombre || "",
            slug: myStore.slug || "",
            rubro: myStore.rubro || "",
            descripcion_corta: myStore.descripcion_corta || "",
          });
          setPreviewLogo(myStore.logo_url);
          setPreviewBanner(myStore.banner_url);
        } else {
          throw new Error("No se encontró ninguna tienda asociada a este usuario.");
        }
      } catch (error) {
        console.error("Error fetching store data:", error);
        setGlobalMessage({
          type: "error",
          text: "No se pudieron cargar los datos de la tienda.",
        });
      } finally {
        setPageLoading(false);
      }
    };
    fetchStoreData();
  }, []);

  const handleDetailsChange = (e) => {
    setDetailsData({ ...detailsData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedLogo(file);
      setPreviewLogo(URL.createObjectURL(file));
      setGlobalMessage({ type: "", text: "" });
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedBanner(file);
      setPreviewBanner(URL.createObjectURL(file));
      setGlobalMessage({ type: "", text: "" });
    }
  };

  const handleGlobalSubmit = async (e) => {
    e.preventDefault();
    setGlobalMessage({ type: "", text: "" });
    setIsSaving(true);
    let success = true;

    try {
      // PASO 1: Guardar Detalles de Texto
      await apiClient.patch(
        `/saas/tiendas/${storeId}/`,
        detailsData
      );

      // PASO 2: Guardar Logo (solo si cambió)
      if (selectedLogo) {
        const logoFormData = new FormData();
        logoFormData.append("logo", selectedLogo);
        const logoResponse = await apiClient.post(
          `/saas/tiendas/${storeId}/upload-logo/`,
          logoFormData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setPreviewLogo(logoResponse.logo);
        setSelectedLogo(null);
      }

      // PASO 3: Guardar Banner (solo si cambió)
      if (selectedBanner) {
        const bannerFormData = new FormData();
        bannerFormData.append("banner", selectedBanner);
        const bannerResponse = await apiClient.post(
          `/saas/tiendas/${storeId}/upload-banner/`,
          bannerFormData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setPreviewBanner(bannerResponse.banner);
        setSelectedBanner(null);
      }

    } catch (error) {
      console.error("Error updating store:", error);
      setGlobalMessage({ type: "error", text: "Error al guardar los cambios." });
      success = false;
    } finally {
      setIsSaving(false);
      if (success) {
        setGlobalMessage({
          type: "success",
          text: "¡Tienda actualizada exitosamente!",
        });
      }
    }
  };
  
  if (pageLoading) return <div className="p-8 text-center">Cargando datos de la tienda...</div>;
  
  const defaultBanner = "https://via.placeholder.com/1000x300?text=Sube+tu+banner";

  return (
    <div className="bg-gray-100 min-h-screen px-6 pb-6 md:px-10 md:pb-10 pt-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Configurar mi Tienda
        </h1>

        <form onSubmit={handleGlobalSubmit} className="space-y-10">
          
          {/* SECCIÓN DE IMÁGENES */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <Image className="h-6 w-6" />
              Identidad Visual
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <ImageUploader
                  label="Logo (Cuadrado)"
                  previewUrl={previewLogo}
                  onFileChange={handleLogoChange}
                  inputRef={logoInputRef}
                  aspectClass="aspect-square"
                />
              </div>
              <div className="md:col-span-2">
                <ImageUploader
                  label="Banner (Rectangular)"
                  previewUrl={previewBanner || defaultBanner}
                  onFileChange={handleBannerChange}
                  inputRef={bannerInputRef}
                  aspectClass="aspect-video"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN DE DETALLES */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <Store className="h-6 w-6" />
              Detalles de la Tienda
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Nombre de la Tienda"
                name="nombre"
                value={detailsData.nombre}
                onChange={handleDetailsChange}
                placeholder="Ej: Tienda de Ropa 'La Elegante'"
                disabled={isSaving}
              />
              <FormInput
                label="Slug (URL)"
                name="slug"
                value={detailsData.slug}
                onChange={handleDetailsChange}
                placeholder="Ej: mi-tienda-elegante (se genera solo si se deja vacío)"
                disabled={isSaving}
              />
              <FormInput
                label="Rubro"
                name="rubro"
                value={detailsData.rubro}
                onChange={handleDetailsChange}
                placeholder="Ej: Ropa, Electrónica, Comida"
                disabled={isSaving}
              />
              <div className="sm:col-span-2">
                <FormTextarea
                  label="Descripción Corta (Slogan)"
                  name="descripcion_corta"
                  value={detailsData.descripcion_corta}
                  onChange={handleDetailsChange}
                  placeholder="Ej: La mejor calidad en ropa para damas."
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* BOTÓN DE GUARDAR UNIFICADO */}
          <div className="bg-white rounded-xl shadow-md p-6 flex justify-end items-center">
            {/* Mensaje de alerta ahora más pegado al botón */}
            <div className="flex-grow">
              <Alert type={globalMessage.type} message={globalMessage.text} />
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 ml-4"
            >
              {isSaving ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditStore;