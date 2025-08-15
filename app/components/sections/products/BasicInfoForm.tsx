// app/dashboard/products/new/sections/BasicInfoForm.tsx
'use client';

import { useForm } from 'react-hook-form';

export default function BasicInfoForm({ defaultValues, onNext }: any) {
  const { register, handleSubmit } = useForm({
    defaultValues,
  });

  const onSubmit = (data: any) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nom du produit *</label>
        <input
          type="text"
          {...register('title', { required: true })}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Handle (URL unique)</label>
        <input
          type="text"
          {...register('handle')}
          className="w-full border rounded p-2"
          placeholder="ex: nom-produit"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Sous-titre</label>
        <input
          type="text"
          {...register('subtitle')}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          {...register('description')}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Statut</label>
        <select {...register('status')} className="w-full border rounded p-2">
          <option value="draft">Brouillon</option>
          <option value="proposed">Proposé</option>
          <option value="published">Publié</option>
          <option value="rejected">Rejeté</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" {...register('is_giftcard')} />
        <label>Ceci est une carte-cadeau</label>
      </div>

      <div>
        <label className="block text-sm font-medium">Image miniature (URL)</label>
        <input
          type="text"
          {...register('thumbnail')}
          className="w-full border rounded p-2"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Suivant
      </button>
    </form>
  );
}
