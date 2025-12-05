// components/ui/ImageUploader.tsx
import React from "react";
import type { ProductImage } from "~/types/product-image";

interface ImageUploaderProps {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
}

export default function ImageUploader({ images, onImagesChange }: ImageUploaderProps) {
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages = Array.from(files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
    }));

    onImagesChange([...images, ...newImages]);
  };

  const handleImageRemove = (id: string) => {
    onImagesChange(images.filter(image => image.id !== id));
  };

  return (
    <div>
      <h3 className="text-xl font-medium mb-4">Sélectionner des images du produit</h3>
      <div className="grid grid-cols-5 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <img
              src={image.url}
              alt={`Product Image ${image.id}`}
              className="w-full h-full object-cover rounded-md border-2 border-orange-400"
            />
            <button
              type="button"
              onClick={() => handleImageRemove(image.id)}
              className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              X
            </button>
          </div>
        ))}

        {images.length < 5 &&
          Array.from({ length: 5 - images.length }).map((_, index) => (
            <div key={index} className="relative border-2 border-orange-400 rounded-md">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center h-full text-orange-400 text-lg">+</div>
            </div>
          ))}
      </div>
    </div>
  );
}
