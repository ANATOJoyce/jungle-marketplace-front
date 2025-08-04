import { useState } from "react";
import { FiTrash, FiPlus, FiImage } from "react-icons/fi";
import { SingleImageUploader } from "./MultipleImageUploader";
import { Button } from "~/components/ui/Button";

export type ProductStatus = "draft" | "proposed" | "published" | "rejected";

export interface ProductVariantValues {
  title: string;
  sku?: string;
  price?: number;
  stock?: number;
}

export interface ProductFormValues {
  title: string;
  handle: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  images: string[];
  weight?: number;
  length?: number;
  height?: number;
  width?: number;
  origin_country?: string;
  hs_code?: string;
  mid_code?: string;
  material?: string;
  discountable: boolean;
  external_id?: string;
  metadata?: Record<string, any>;
  status?: ProductStatus;
  variants?: ProductVariantValues[];
}

interface ProductFormProps {
  initialData?: Partial<ProductFormValues>;
  onSubmit: (data: Omit<ProductFormValues, "status"> & { status?: ProductStatus }) => void;
  loading?: boolean;
}

export function ProductForm({ initialData = {}, onSubmit, loading = false }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormValues>({
    title: "",
    handle: "",
    subtitle: "",
    description: "",
    thumbnail: "",
    images: initialData.images 
      ? [...initialData.images, ...Array(Math.max(0, 5 - initialData.images.length)).fill("")].slice(0, 5) 
      : Array(5).fill(""),
    weight: undefined,
    length: undefined,
    height: undefined,
    width: undefined,
    origin_country: "",
    hs_code: "",
    mid_code: "",
    material: "",
    discountable: true,
    external_id: "",
    metadata: {},
    status: "draft",
    variants: initialData.variants || [],
    ...initialData,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === "number") {
      setFormData(prev => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { status, ...rest } = formData;
    onSubmit({ ...rest, status });
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), { title: "", sku: "", price: 0, stock: 0 }],
    }));
  };

  const updateVariant = (index: number, key: keyof ProductVariantValues, value: any) => {
    setFormData((prev) => {
      const newVariants = [...(prev.variants || [])];
      newVariants[index] = { ...newVariants[index], [key]: value };
      return { ...prev, variants: newVariants };
    });
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => {
      const newVariants = [...(prev.variants || [])];
      newVariants.splice(index, 1);
      return { ...prev, variants: newVariants };
    });
  };

  const handleImageChange = (index: number, imageUrl: string) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[index] = imageUrl;
      return {
        ...prev,
        images: newImages,
        thumbnail: prev.thumbnail || imageUrl,
      };
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      const removedImage = newImages[index];
      newImages[index] = "";
      return {
        ...prev,
        images: newImages,
        thumbnail: prev.thumbnail === removedImage ? (newImages.find(img => img) || "") : prev.thumbnail,
      };
    });
  };

  const setThumbnail = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      thumbnail: imageUrl,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {initialData.title ? "MODIFIER LE PRODUIT" : "CRÉER UN NOUVEAU PRODUIT"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de base */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Informations de base</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                <input
                  name="handle"
                  value={formData.handle}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sous-titre</label>
              <input
                name="subtitle"
                value={formData.subtitle || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Images du produit</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group h-32">
                  <SingleImageUploader
                    image={image}
                    onChange={(imageUrl) => handleImageChange(index, imageUrl)}
                    className="h-full w-full border-2 border-dashed rounded-lg"
                    cropAspect={1}
                    showRemoveButton={false}
                    emptyContent={
                      <div className="flex flex-col items-center justify-center h-full">
                        <FiImage className="text-gray-400 text-2xl" />
                        <span className="text-xs text-gray-500 mt-2">Emplacement {index + 1}</span>
                      </div>
                    }
                  />
                  
                  {image && (
                    <>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        aria-label="Supprimer l'image"
                      >
                        <FiTrash size={14} />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setThumbnail(image)}
                        className={`absolute bottom-2 right-2 text-xs px-2 py-1 rounded transition-colors ${
                          formData.thumbnail === image 
                            ? "bg-orange-500 text-white" 
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {formData.thumbnail === image ? "Principale" : "Définir"}
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Détails logistiques */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Détails logistiques</h2>
            
            <div className="grid md:grid-cols-4 gap-4">
              {["weight", "length", "height", "width"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.charAt(0).toUpperCase() + field.slice(1)} {field === "weight" ? "(g)" : "(cm)"}
                  </label>
                  <input
                    name={field}
                    type="number"
                    value={formData[field as keyof ProductFormValues] as number | undefined ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Informations douanières */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Informations douanières</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {["origin_country", "hs_code", "mid_code", "material"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field === "origin_country" ? "Pays d'origine" : field.replace("_", " ").toUpperCase()}
                  </label>
                  <input
                    name={field}
                    value={formData[field as keyof ProductFormValues] as string ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Options</h2>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="discountable"
                name="discountable"
                checked={formData.discountable}
                onChange={handleChange}
                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="discountable" className="ml-2 block text-sm text-gray-700">
                Éligible aux promotions
              </label>
              
              <div className="ml-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <span className="text-sm px-3 py-1 bg-gray-100 rounded border border-gray-300">
                  {formData.status?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Variantes */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-semibold">Variantes</h2>
              <Button
                type="button"
                onClick={addVariant}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FiPlus size={16} />
                Ajouter une variante
              </Button>
            </div>
            
            {formData.variants?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Aucune variante ajoutée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.variants?.map((variant, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                        <input
                          value={variant.title}
                          onChange={(e) => updateVariant(index, "title", e.target.value)}
                          required
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                        <input
                          value={variant.sku || ""}
                          onChange={(e) => updateVariant(index, "sku", e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
                        <input
                          type="number"
                          value={variant.price ?? ""}
                          onChange={(e) => updateVariant(index, "price", Number(e.target.value))}
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                        <input
                          type="number"
                          value={variant.stock ?? ""}
                          onChange={(e) => updateVariant(index, "stock", Number(e.target.value))}
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() => removeVariant(index)}
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash className="mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={loading}
              className="px-10"
            >
              {loading ? "En cours..." : (initialData.title ? "Modifier le produit" : "Créer le produit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}