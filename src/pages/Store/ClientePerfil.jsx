import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import apiClient from "../../services/apiClient";
import {
  UserCircleIcon,
  LockClosedIcon,
  PhotoIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  MapPinIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

// Loading mejorado
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg font-medium">Cargando perfil...</p>
    </div>
  </div>
);

const Alert = ({ type, message }) => {
  if (!message) return null;
  const styles = {
    success: {
      bg: "bg-green-100 border-green-500",
      icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      text: "text-green-800",
    },
    error: {
      bg: "bg-red-100 border-red-500",
      icon: <ExclamationCircleIcon className="h-5 w-5 text-red-500" />,
      text: "text-red-800",
    },
  };
  const s = styles[type] || styles.error;
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${s.bg} border-l-4 rounded-md p-4 my-4`}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">{s.icon}</div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${s.text}`}>{message}</p>
        </div>
      </div>
    </motion.div>
  );
};

const ProfileInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  autoComplete = "off",
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
    />
  </div>
);

const ProfileSelect = ({ label, name, value, onChange, children }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <select
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
    >
      {children}
    </select>
  </div>
);

// Componente para mostrar información en el resumen
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-2">
    <div className="flex-shrink-0 w-5 h-5 text-orange-600 mt-0.5">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-600 truncate">{value || "-"}</p>
    </div>
  </div>
);

const ClientePerfil = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    email: "",
    nombre: "",
    apellido: "",
    ci: "",
    direccion: "",
    fecha_nacimiento: "",
    genero: "",
    telefono: "",
    nit: "",
    razon_social: "",
  });
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [photoMessage, setPhotoMessage] = useState({ type: "", text: "" });

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getMe();
        setUserData(data);
        
        setProfileData({
          email: data.email || "",
          nombre: data.profile?.nombre || "",
          apellido: data.profile?.apellido || "",
          ci: data.profile?.ci || "",
          direccion: data.profile?.direccion || "",
          fecha_nacimiento: data.profile?.fecha_nacimiento || "",
          genero: data.profile?.genero || "",
          telefono: data.profile?.telefono || "",
          nit: data.cliente_profile_data?.nit || "",
          razon_social: data.cliente_profile_data?.razon_social || "",
        });
        
        if (data.profile?.foto_perfil) {
          setPreviewUrl(data.profile.foto_perfil);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setProfileMessage({
          type: "error",
          text: "No se pudieron cargar los datos del perfil.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPhotoMessage({ type: "", text: "" });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: "", text: "" });

    const dataToSend = {
      email: profileData.email,
      profile: {
        nombre: profileData.nombre,
        apellido: profileData.apellido,
        ci: profileData.ci,
        direccion: profileData.direccion,
        fecha_nacimiento: profileData.fecha_nacimiento || null,
        genero: profileData.genero,
        telefono: profileData.telefono,
      },
      cliente_profile: {
        nit: profileData.nit,
        razon_social: profileData.razon_social,
      },
    };

    try {
      const updatedUser = await apiClient.updateMe(dataToSend);
      setUserData(updatedUser);
      setProfileMessage({
        type: "success",
        text: "Perfil actualizado exitosamente.",
      });

      const localUser = JSON.parse(localStorage.getItem("userData") || "{}");
      localUser.nombre_completo = `${updatedUser.profile.nombre} ${updatedUser.profile.apellido}`;
      localStorage.setItem("userData", JSON.stringify(localUser));

      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      let errorMsg = "Ocurrió un error al actualizar.";
      if (error && typeof error === "object") {
        if (error.email) errorMsg = `Email: ${error.email[0]}`;
        else if (error.profile)
          errorMsg = `Perfil: ${Object.values(error.profile)[0][0]}`;
        else if (error.cliente_profile)
          errorMsg = `Facturación: ${Object.values(error.cliente_profile)[0][0]}`;
      }
      setProfileMessage({ type: "error", text: errorMsg });
    }
  };

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setPhotoMessage({
        type: "error",
        text: "Por favor, selecciona un archivo.",
      });
      return;
    }

    setPhotoMessage({ type: "", text: "" });
    const formData = new FormData();
    formData.append("foto_perfil", selectedFile);

    try {
      const response = await apiClient.uploadMyPhoto(formData);
      const newPhotoUrl = response.foto_perfil;
      setUserData((prev) => ({
        ...prev,
        profile: { ...prev.profile, foto_perfil: newPhotoUrl },
      }));
      setPreviewUrl(newPhotoUrl);
      setSelectedFile(null);
      setPhotoMessage({ type: "success", text: "Foto de perfil actualizada." });
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error("Error uploading photo:", error);
      setPhotoMessage({
        type: "error",
        text: "Error al subir la imagen. Inténtalo de nuevo.",
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMessage({
        type: "error",
        text: "Las nuevas contraseñas no coinciden.",
      });
      return;
    }

    if (!passwordData.old_password || !passwordData.new_password) {
      setPasswordMessage({
        type: "error",
        text: "Todos los campos son requeridos.",
      });
      return;
    }

    try {
      const dataToSend = {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      };
      await apiClient.changeMyPassword(dataToSend);
      setPasswordMessage({
        type: "success",
        text: "Contraseña cambiada correctamente.",
      });
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMsg =
        error.old_password?.[0] ||
        error.new_password?.[0] ||
        "Error al cambiar la contraseña.";
      setPasswordMessage({ type: "error", text: errorMsg });
    }
  };

  if (loading) return <LoadingSpinner />;

  const defaultAvatar =
    "https://ui-avatars.com/api/?name=" +
    (profileData.nombre || "Usuario") +
    "&background=F97316&color=fff";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
            <p className="text-orange-100 mt-1">Gestiona tu información personal</p>
          </div>
          <Link
            to="/tiendas"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Volver a Tiendas
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Columna izquierda - Foto de perfil y Resumen */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Tarjeta de Foto */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={previewUrl || defaultAvatar}
                    alt="Foto de perfil"
                    className="w-32 h-32 rounded-full object-cover border-4 border-orange-100 mx-auto"
                  />
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-2 right-2 bg-orange-600 text-white p-2 rounded-full shadow-lg hover:bg-orange-700 transition-all"
                  >
                    <CameraIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-800 mt-4">
                  {profileData.nombre} {profileData.apellido}
                </h2>
                <p className="text-gray-600 text-sm">{profileData.email}</p>

                <form onSubmit={handlePhotoSubmit} className="mt-6 space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  
                  <Alert type={photoMessage.type} message={photoMessage.text} />
                  
                  {selectedFile && (
                    <motion.button
                      type="submit"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckIcon className="w-4 h-4" />
                      Guardar Foto
                    </motion.button>
                  )}
                </form>
              </div>
            </div>

            {/* Tarjeta de Resumen */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">
                Resumen de Información
              </h3>
              <div className="space-y-1">
                <InfoItem
                  icon={<EnvelopeIcon />}
                  label="Correo"
                  value={profileData.email}
                />
                <InfoItem
                  icon={<PhoneIcon />}
                  label="Teléfono"
                  value={profileData.telefono}
                />
                <InfoItem
                  icon={<IdentificationIcon />}
                  label="CI"
                  value={profileData.ci}
                />
                <InfoItem
                  icon={<MapPinIcon />}
                  label="Dirección"
                  value={profileData.direccion}
                />
                <InfoItem
                  icon={<CalendarIcon />}
                  label="Fecha Nacimiento"
                  value={profileData.fecha_nacimiento}
                />
                <InfoItem
                  icon={<UserCircleIcon />}
                  label="Género"
                  value={
                    profileData.genero === "MASCULINO" ? "Masculino" :
                    profileData.genero === "FEMENINO" ? "Femenino" : "-"
                  }
                />
                {profileData.nit && (
                  <InfoItem
                    icon={<IdentificationIcon />}
                    label="NIT"
                    value={profileData.nit}
                  />
                )}
                {profileData.razon_social && (
                  <InfoItem
                    icon={<UserCircleIcon />}
                    label="Razón Social"
                    value={profileData.razon_social}
                  />
                )}
              </div>
            </div>
          </motion.div>

          {/* Columna derecha - Formularios */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 space-y-8"
          >
            {/* Información Personal */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <UserCircleIcon className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Editar Información Personal
                </h2>
              </div>
              
              <form onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileInput
                    label="Nombre"
                    name="nombre"
                    value={profileData.nombre}
                    onChange={handleProfileChange}
                  />
                  <ProfileInput
                    label="Apellido"
                    name="apellido"
                    value={profileData.apellido}
                    onChange={handleProfileChange}
                  />
                  <ProfileInput
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                  />
                  <ProfileInput
                    label="Teléfono"
                    name="telefono"
                    value={profileData.telefono}
                    onChange={handleProfileChange}
                  />
                  <ProfileInput
                    label="Dirección"
                    name="direccion"
                    value={profileData.direccion}
                    onChange={handleProfileChange}
                  />
                  <ProfileInput
                    label="Cédula de Identidad"
                    name="ci"
                    value={profileData.ci}
                    onChange={handleProfileChange}
                  />
                  <ProfileSelect
                    label="Género"
                    name="genero"
                    value={profileData.genero}
                    onChange={handleProfileChange}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                  </ProfileSelect>
                  <ProfileInput
                    label="Fecha de Nacimiento"
                    name="fecha_nacimiento"
                    type="date"
                    value={profileData.fecha_nacimiento}
                    onChange={handleProfileChange}
                  />
                </div>

                {/* Información de Facturación */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Información de Facturación (Opcional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileInput
                      label="NIT"
                      name="nit"
                      value={profileData.nit}
                      onChange={handleProfileChange}
                    />
                    <ProfileInput
                      label="Razón Social"
                      name="razon_social"
                      value={profileData.razon_social}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <Alert type={profileMessage.type} message={profileMessage.text} />
                
                <div className="flex justify-end mt-6">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-orange-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-orange-700 transition-all flex items-center gap-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Guardar Cambios
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Cambiar Contraseña */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <LockClosedIcon className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Cambiar Contraseña
                </h2>
              </div>
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-6">
                  <ProfileInput
                    label="Contraseña Actual"
                    name="old_password"
                    type="password"
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                  />
                  <ProfileInput
                    label="Nueva Contraseña"
                    name="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                  />
                  <ProfileInput
                    label="Confirmar Nueva Contraseña"
                    name="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                  />
                  
                  <Alert type={passwordMessage.type} message={passwordMessage.text} />
                  
                  <div className="flex justify-end">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-orange-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-orange-700 transition-all flex items-center gap-2"
                    >
                      <LockClosedIcon className="w-4 h-4" />
                      Cambiar Contraseña
                    </motion.button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ClientePerfil;