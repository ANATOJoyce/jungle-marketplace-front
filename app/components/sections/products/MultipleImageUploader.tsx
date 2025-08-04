"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import { FiImage, FiX } from "react-icons/fi";
import { getCroppedImg } from "~/utils/cropImage";

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
  cropAspect?: number;
  single?: boolean;
  className?: string;
};

export function MultipleImageUploader({
  images = [],
  onChange,
  max = 5,
  cropAspect = 1,
  single = false,
  className = "",
}: Props) {
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [zoom, setZoom] = useState(1);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length || (single && images.length >= 1) || images.length >= max) return;
      const file = acceptedFiles[0];
      const preview = URL.createObjectURL(file);
      setCropImage(preview);
    },
    [images.length, max, single]
  );

  const handleCropDone = async () => {
    if (!cropImage || !croppedAreaPixels) return;

    const croppedBlob = await getCroppedImg(
      cropImage,
      { x: 0, y: 0 },
      zoom,
      cropAspect,
      croppedAreaPixels
    );

    const formData = new FormData();
    formData.append("file", croppedBlob);
    formData.append("upload_preset", "Jungle");
    formData.append("folder", "samples/ecommerce");

    const res = await fetch("https://api.cloudinary.com/v1_1/ds8qdsews/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.secure_url) {
      const newImages = single ? [data.secure_url] : [...images, data.secure_url];
      onChange(newImages);
    }

    setCropImage(null);
    setZoom(1);
  };

  const handleRemove = (url: string) => {
    onChange(images.filter((img) => img !== url));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: !single,
    onDrop,
    disabled: (single && images.length >= 1) || images.length >= max,
  });

  return (
    <div className={className}>
      {!single && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images produit (max {max})
        </label>
      )}

      {((single && images.length === 0) || (!single && images.length < max)) && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
            isDragActive ? "border-blue-500" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-blue-500">Déposez ici...</p>
          ) : (
            <p className="text-gray-500">
              {single ? "Cliquez ou glissez une image" : `Cliquez ou glissez des images (max ${max})`}
            </p>
          )}
        </div>
      )}

      {images.length > 0 && (
        <div className={`grid ${single ? "" : "grid-cols-2 md:grid-cols-3"} gap-4 mt-4`}>
          {images.map((url, idx) => (
            <div key={url} className="relative group">
              <img
                src={url}
                alt={`Image ${idx + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
              {idx === 0 && !single && (
                <span className="absolute bottom-1 left-1 text-white text-xs bg-black bg-opacity-50 px-1 rounded">
                  Thumbnail
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {cropImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-white rounded-md shadow-lg p-4 w-full max-w-xl">
            <div className="relative w-full h-96">
              <Cropper
                image={cropImage}
                crop={{ x: 0, y: 0 }}
                zoom={zoom}
                aspect={cropAspect}
                onCropChange={() => {}}
                onCropComplete={(_, cropped) => setCroppedAreaPixels(cropped)}
                onZoomChange={setZoom}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setCropImage(null)}
                className="px-4 py-2 border rounded"
              >
                Annuler
              </button>
              <button
                onClick={handleCropDone}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SingleImageUploaderProps {
  image: string;
  onChange: (imageUrl: string) => void;
  className?: string;
  cropAspect?: number;
  emptyContent?: React.ReactNode;
  showRemoveButton?: boolean;
  label?: string;  // <-- Ajouté ici
}

export function SingleImageUploader({
  image,
  onChange,
  className = "",
  cropAspect = 1,
  emptyContent = (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <FiImage className="text-2xl" />
      <span className="text-xs mt-2">Ajouter une image</span>
    </div>
  ),
  showRemoveButton = true,
  label,  // <-- récupère la prop label
}: SingleImageUploaderProps) {
  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className={`relative ${className}`}>
      {/* Affichage du label s'il est défini */}
      {label && <label className="block mb-2 font-medium text-gray-700">{label}</label>}

      <MultipleImageUploader
        images={image ? [image] : []}
        onChange={(urls) => onChange(urls.length > 0 ? urls[0] : "")}
        single={true}
        max={1}
        cropAspect={cropAspect}
        className="h-full w-full"
      />

      {!image && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {emptyContent}
        </div>
      )}

      {image && showRemoveButton && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          aria-label="Supprimer l'image"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
}