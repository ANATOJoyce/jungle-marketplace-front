// src/components/ProductDetails.tsx
import { useState } from 'react';
import { FormInput } from '~/components/FormInput';

interface ProductDetailsProps {
  onNext: (data: any) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ onNext }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [handle, setHandle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title) newErrors.title = 'Le titre est obligatoire';
    if (!handle) newErrors.handle = 'Le handle est obligatoire';
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      onNext({
        title,
        subtitle,
        handle,
        description,
      });
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Détails du produit</h2>
      <FormInput
        label="Titre"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
      />
      <FormInput
        label="Sous-titre"
        name="subtitle"
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
      />
      <FormInput
        label="Handle (URL)"
        name="handle"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        error={errors.handle}
      />
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white font-medium text-sm rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Continuer
      </button>
    </div>
  );
};

export default ProductDetails;
