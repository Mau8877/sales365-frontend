import React, { useState, useEffect, useRef } from "react";
import apiClient from "../../services/apiClient";
import {
  UserCircleIcon,
  LockClosedIcon,
  PhotoIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const Alert = ({ type, message }) => {
  if (!message) return null;
  const styles = {
    success: {
      bg: "bg-green-100",
      icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      text: "text-green-800",
    },
    error: {
      bg: "bg-red-100",
      icon: <ExclamationCircleIcon className="h-5 w-5 text-red-500" />,
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

const ProfileInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  autoComplete = "off",
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

const ProfileSelect = ({ label, name, value, onChange, children }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <select
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    >
      {children}
    </select>
  </div>
);

const EditProfile = () => {
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

      // 🔄 recargar luego de 2s
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      let errorMsg = "Ocurrió un error al actualizar.";
      if (error && typeof error === "object") {
        if (error.email) errorMsg = `Email: ${error.email[0]}`;
        else if (error.profile)
          errorMsg = `Perfil: ${Object.values(error.profile)[0][0]}`;
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

  if (loading) return <div className="p-8 text-center">Cargando perfil...</div>;

  const defaultAvatar =
    "https://ui-avatars.com/api/?name=" +
    (profileData.nombre || "Usuario") +
    "&background=0D89EC&color=fff";

  return (
    <div className="bg-gray-100 min-h-screen px-6 pb-6 md:px-10 md:pb-10 pt-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mi Perfil</h1>

        {/* 🧩 CABECERA */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center md:w-1/3">
            <img
              src={previewUrl || defaultAvatar}
              alt="Foto de perfil"
              className="w-40 h-40 rounded-full object-cover mb-4 border-4 border-gray-200"
            />
            <form onSubmit={handlePhotoSubmit} className="w-full text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mb-3"
              >
                Cambiar Imagen
              </button>
              <Alert type={photoMessage.type} message={photoMessage.text} />
              {selectedFile && (
                <button
                  type="submit"
                  className="w-full py-2 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm"
                >
                  Guardar Foto
                </button>
              )}
            </form>
          </div>

          <div className="md:w-2/3">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Información del Usuario
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-gray-700">
              <p>
                <span className="font-semibold">Nombre:</span>{" "}
                {profileData.nombre} {profileData.apellido}
              </p>
              <p>
                <span className="font-semibold">Correo:</span> {profileData.email}
              </p>
              <p>
                <span className="font-semibold">CI:</span> {profileData.ci}
              </p>
              <p>
                <span className="font-semibold">Teléfono:</span> {profileData.telefono}
              </p>
              <p>
                <span className="font-semibold">Género:</span>{" "}
                {profileData.genero === "MASCULINO"
                  ? "Masculino"
                  : profileData.genero === "FEMENINO"
                  ? "Femenino"
                  : "-"}
              </p>
              <p>
                <span className="font-semibold">Nacimiento:</span>{" "}
                {profileData.fecha_nacimiento || "-"}
              </p>
              <p className="sm:col-span-2">
                <span className="font-semibold">Dirección:</span>{" "}
                {profileData.direccion || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* 📝 FORMULARIO DE EDICIÓN */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Editar Información
          </h2>
          <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <ProfileInput
              label="Cédula de Identidad"
              name="ci"
              value={profileData.ci}
              onChange={handleProfileChange}
            />
            <div className="sm:col-span-2 text-right">
              <Alert type={profileMessage.type} message={profileMessage.text} />
              <button
                type="submit"
                className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>

        {/* 🔒 FORMULARIO DE CONTRASEÑA */}
            <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Cambiar Contraseña
            </h2>
            <form onSubmit={handlePasswordSubmit} className="w-full p-2 space-y-4">
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
                <button
                    type="submit"
                    className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm"
                >
                    Cambiar Contraseña
                </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
