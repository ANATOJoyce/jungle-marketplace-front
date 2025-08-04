// components/product/form-step1-details.tsx
import { useFormContext } from "react-hook-form";

export function Step1Details() {
  const { register } = useFormContext();

  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Détails du produit</h2>

      <div className="flex flex-col gap-4">
        <input type="text" placeholder="Titre *" {...register("title")} />
        <input type="text" placeholder="Sous-titre" {...register("subtitle")} />
        <input type="text" placeholder="Handle (URL)" {...register("handle")} />
        <textarea placeholder="Description" {...register("description")} />
      </div>
    </section>
  );
}
