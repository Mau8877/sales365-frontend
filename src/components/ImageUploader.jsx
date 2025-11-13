import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Star, CheckCircle } from 'lucide-react';

/**
 * Componente para gestionar la subida de imágenes con drag-and-drop,
 * previsualización y selección de foto principal.
 * * Gestiona dos tipos de fotos:
 * - existingPhotos: Las que ya están en el servidor (para modo edición).
 * - newFiles: Las que el usuario acaba de añadir (archivos locales).
 */
const ImageUploader = ({ 
  initialPhotos = [], 
  maxFiles = 5,
  onChange 
}) => {
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [error, setError] = useState('');

  // Sincroniza el estado con los datos iniciales (para modo edición)
  useEffect(() => {
    setExistingPhotos(initialPhotos.map(photo => ({
      ...photo,
      type: 'existing',
      preview: photo.foto, // URL de la foto del servidor
    })));
  }, [initialPhotos]);

  // Combina ambas listas para el renderizado
  const allPhotos = [...existingPhotos, ...newFiles];
  const totalPhotos = allPhotos.length;
  
  // Función para notificar al formulario padre sobre los cambios
  const notifyParent = (currentExisting, currentNew) => {
    setError(''); // Limpia el error al cambiar
    const principalPhoto = [...currentExisting, ...currentNew].find(p => p.principal);

    onChange({
      newFiles: currentNew, // Archivos para SUBIR
      filesToDelete: initialPhotos.filter(
        initial => !currentExisting.find(ex => ex.id === initial.id)
      ).map(p => p.id), // IDs de fotos existentes para BORRAR
      principalPhoto: principalPhoto ? {
        id: principalPhoto.id,
        type: principalPhoto.type
      } : null,
    });
  };

  // Lógica de Dropzone
  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    setError('');
    
    if (fileRejections.length > 0) {
      setError(`Solo se permiten imágenes (${fileRejections[0].errors[0].message})`);
      return;
    }

    const filesToAdd = acceptedFiles.slice(0, maxFiles - totalPhotos);

    if (acceptedFiles.length + totalPhotos > maxFiles) {
      setError(`Solo puedes subir un máximo de ${maxFiles} fotos.`);
    }

    const filesWithPreview = filesToAdd.map((file, index) => ({
      file: file,
      preview: URL.createObjectURL(file),
      type: 'new',
      id: `new-${Date.now()}-${index}`, // ID temporal
      principal: false,
    }));

    // Si es la primera foto, se marca como principal
    if (totalPhotos === 0 && filesWithPreview.length > 0) {
      filesWithPreview[0].principal = true;
    }

    const updatedNewFiles = [...newFiles, ...filesWithPreview];
    setNewFiles(updatedNewFiles);
    notifyParent(existingPhotos, updatedNewFiles);

  }, [existingPhotos, newFiles, totalPhotos, maxFiles]);

  // Configuración de Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxFiles: maxFiles,
    disabled: totalPhotos >= maxFiles,
  });

  // Lógica de Acciones de Foto
  const handleSetPrincipal = (id) => {
    const updatedExisting = existingPhotos.map(p => ({
      ...p,
      principal: p.id === id,
    }));
    const updatedNew = newFiles.map(p => ({
      ...p,
      principal: p.id === id,
    }));

    setExistingPhotos(updatedExisting);
    setNewFiles(updatedNew);
    notifyParent(updatedExisting, updatedNew);
  };

  const handleRemove = (id, type) => {
    let updatedExisting = [...existingPhotos];
    let updatedNew = [...newFiles];
    let wasPrincipal = false;

    if (type === 'existing') {
      const photoToRemove = existingPhotos.find(p => p.id === id);
      wasPrincipal = photoToRemove?.principal;
      updatedExisting = existingPhotos.filter(p => p.id !== id);
      setExistingPhotos(updatedExisting);
    } else { // type === 'new'
      const fileToRemove = newFiles.find(p => p.id === id);
      wasPrincipal = fileToRemove?.principal;
      // Revocamos el object URL para liberar memoria
      URL.revokeObjectURL(fileToRemove.preview);
      updatedNew = newFiles.filter(p => p.id !== id);
      setNewFiles(updatedNew);
    }

    // Si borramos la principal, asignamos una nueva principal
    if (wasPrincipal && (updatedExisting.length + updatedNew.length > 0)) {
      if (updatedExisting.length > 0) {
        updatedExisting[0].principal = true;
      } else {
        updatedNew[0].principal = true;
      }
    }

    notifyParent(updatedExisting, updatedNew);
  };

  // Limpieza de Object URLs al desmontar
  useEffect(() => {
    return () => newFiles.forEach(file => URL.revokeObjectURL(file.preview));
  }, [newFiles]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700">Fotos del Producto</label>
      
      {/* Zona de Dropzone */}
      {totalPhotos < maxFiles && (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center text-gray-500">
            <UploadCloud size={40} className="mb-2" />
            <p className="font-semibold">Arrastra tus fotos aquí o haz clic</p>
            <p className="text-sm">PNG, JPG, WEBP (Máx. {maxFiles} fotos)</p>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Previsualización de Fotos */}
      {totalPhotos > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
          {allPhotos.map((photo) => (
            <div key={photo.id} className="relative aspect-square border rounded-md overflow-hidden group">
              <img 
                src={photo.preview} 
                alt="Previsualización" 
                className="w-full h-full object-cover"
              />
              
              {/* Botón de Borrar */}
              <button
                type="button"
                onClick={() => handleRemove(photo.id, photo.type)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-75 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
              
              {/* Overlay de "Principal" */}
              {photo.principal ? (
                <div className="absolute bottom-0 left-0 right-0 p-1 bg-green-600 bg-opacity-80 text-white text-xs font-bold text-center flex items-center justify-center gap-1">
                  <CheckCircle size={12} />
                  Principal
                </div>
              ) : (
                // Botón para hacer principal
                <button
                  type="button"
                  onClick={() => handleSetPrincipal(photo.id)}
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-black bg-opacity-50 text-white rounded-md text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                >
                  <Star size={12} />
                  Elegir
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;