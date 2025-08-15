'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react'; // ou utiliser un SVG inline

type Props = {
  defaultValues: any;
  onNext: (data: any) => void;
  onBack: () => void;
};

export default function MediaForm({ defaultValues, onNext, onBack }: Props) {
  const [images, setImages] = useState<string[]>(defaultValues.images || []);
  const [showInput, setShowInput] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  const addImage = () => {
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim())) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
      setShowInput(false);
    }
  };

  const removeImage = (url: string) => {
    setImages(images.filter((img) => img !== url));
  };

  const handleSubmit = () => {
    onNext({ images });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Images du produit</h2>

      <div className="flex flex-wrap gap-4">
        {/* Zone "Ajouter une image" */}
        <div
          onClick={() => setShowInput(true)}
          className="w-32 h-32 border-2 border-dashed border-orange-400 text-orange-500 flex items-center justify-center rounded cursor-pointer hover:bg-orange-50"
        >
          <Plus size={24} />
        </div>

        {/* Images ajoutées */}
        {images.map((url, idx) => (
          <div key={idx} className="relative w-32 h-32 group">
            <img
              src={url}
              alt={`Image ${idx + 1}`}
              className="w-full h-full object-cover rounded border"
            />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 py-0.5 rounded hover:bg-red-700"
            >
              ✖
            </button>
          </div>
        ))}
      </div>

      {/* Champ de saisie URL */}
      {showInput && (
        <div className="flex gap-2 mt-4">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Collez une URL d’image"
            className="flex-1 border rounded p-2"
          />
          <button
            onClick={addImage}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Ajouter
          </button>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
