import { useEffect, useState } from "react";
import { PlusIcon, TrashIcon } from "lucide-react";
import { FormInput } from "~/components/ui/FormInput";
import { Button } from "~/components/ui/Button";
import { ProductOption } from "~/types/product-option";
import { ProductOptionValue } from "~/types/product-option-value";

type VariantFormData = {
  title: string;
  sku: string;
  ean: string;
  price: number;
};


export default function ProductVariantsForm() {
  const [options, setOptions] = useState<ProductOption[]>([]);

  const handleAddOption = () => {
    setOptions([...options, { title: "", values: [] }]);
};

  const handleChangeOptionTitle = (idx: number, title: string) => {
    const updated = [...options];
    updated[idx].title = title;
    setOptions(updated);
  };

  // Modifier une valeur (ProductOptionValue) d'une option
  const handleChangeValue = (
    optIdx: number,
    valIdx: number,
    value: Partial<ProductOptionValue>
  ) => {
    const updated = [...options];
    const currentValue = updated[optIdx].values?.[valIdx] || { value: "", metadata: {} };
    updated[optIdx].values![valIdx] = { ...currentValue, ...value };
    setOptions(updated);
  };

  // Ajouter une valeur vide dans une option
  const handleAddValue = (optIdx: number) => {
    const updated = [...options];
    if (!updated[optIdx].values) updated[optIdx].values = [];
    updated[optIdx].values.push({ value: "", metadata: {} });
    setOptions(updated);
  };

  // Supprimer une option
  const handleRemoveOption = (index: number) => {
    const updated = [...options];
    updated.splice(index, 1);
    setOptions(updated);
  };

  // Générer les variantes à partir des valeurs (on récupère juste la propriété `value`)
  const generateVariants = (): string[][] => {
    if (options.length === 0) return [];
    const valuesArrays = options.map(opt => opt.values?.map(v => v.value).filter(Boolean) || []);
    return cartesian(valuesArrays);
  };

  // Fonction cartésienne
  const cartesian = (arr: string[][]): string[][] =>
    arr.reduce<string[][]>((a, b) => a.flatMap(x => b.map(y => [...x, y])), [[]]);

  const variants = generateVariants();

  const [variantData, setVariantData] = useState<VariantFormData[]>([]);

 const handleVariantChange = (
  index: number,
  field: keyof VariantFormData,
  value: string | number
) => {
  const updated = [...variantData];
  updated[index] = updated[index] || { title: "", sku: "", ean: "", price: 0 };

  switch (field) {
    case "price":
      updated[index][field] = Number(value);
      break;
    default:
      updated[index][field] = value as string;
  }

  setVariantData(updated);
};


  // Synchroniser variantData avec variants
  useEffect(() => {
    setVariantData(prev => {
      return variants.map((_, i) => prev[i] || { title: "", sku: "", ean: "", price: 0 });
    });
  }, [options]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">3. Variantes du produit</h2>

      {/* OPTIONS */}
      {options.map((opt, i) => (
        <div key={i} className="border rounded-md p-4 space-y-2">
          <FormInput
            label={`Nom de l'option ${i + 1}`}
            name={`option_${i}_title`}
            value={opt.title}
            onChange={(e) => handleChangeOptionTitle(i, e.target.value)}
          />
          {opt.values?.map((val, j) => (
            <FormInput
              key={j}
              label={`Valeur ${j + 1}`}
              name={`option_${i}_value_${j}`}
              value={val.value}
              onChange={(e) => handleChangeValue(i, j, { value: e.target.value })}
            />
          ))}
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" onClick={() => handleAddValue(i)}>
              Ajouter une valeur
            </Button>
            <Button type="button" variant="ghost" onClick={() => handleRemoveOption(i)}>
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}

      <Button variant="outline" type="button" onClick={handleAddOption}>
        <PlusIcon className="w-4 h-4 mr-2" />
        Ajouter une option
      </Button>

      {/* VARIANTS */}
      {variants.length > 0 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-medium">Variantes générées</h3>
          {variants.map((variantCombo, index) => {
            const title = variantCombo.join(" / ");
            return (
              <div key={index} className="border p-4 rounded-md space-y-4">
                <h4 className="font-medium">{title}</h4>
                <FormInput
                  label="SKU"
                  name={`variants[${index}].sku`}
                  value={variantData[index]?.sku || ""}
                  onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                  placeholder="SKU"
                />
                <FormInput
                  label="EAN"
                  name={`variants[${index}].ean`}
                  value={variantData[index]?.ean || ""}
                  onChange={(e) => handleVariantChange(index, "ean", e.target.value)}
                  placeholder="EAN"
                />
                <FormInput
                  label="Prix"
                  name={`variants[${index}].price`}
                  type="number"
                  value={variantData[index]?.price?.toString() || ""}
                  onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
