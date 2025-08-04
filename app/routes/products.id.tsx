// app/routes/products.$id.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Link } from "@remix-run/react";

interface ProductDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  images: string[];
  variants: Variant[];
  categories: Category[];
  options: ProductOption[];
}

interface Variant {
  id: string;
  sku: string;
  price: number;
  options: OptionValue[];
}

interface OptionValue {
  id: string;
  value: string;
  optionId: string;
}

interface Category {
  id: string;
  name: string;
}

interface ProductOption {
  id: string;
  title: string;
  values: OptionValue[];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const response = await fetch(`${process.env.PUBLIC_NEST_API_URL}/product/${params.id}`);
  if (!response.ok) {
    throw new Response("Produit non trouvé", { status: 404 });
  }
  const product: ProductDetails = await response.json();
  return json(product);
}

export default function ProductDetailsPage() {
  const product = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Images */}
          <div className="md:w-1/2 p-4">
            <div className="mb-4">
              {product.images?.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-96 object-contain rounded"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded">
                  <span className="text-gray-500">Pas d'image</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images?.slice(1).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.title} ${index + 2}`}
                  className="w-full h-20 object-cover rounded cursor-pointer"
                />
              ))}
            </div>
          </div>

          {/* Détails */}
          <div className="md:w-1/2 p-6">
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            
            {product.categories?.length > 0 && (
              <div className="mb-4">
                <span className="text-sm text-gray-600">Catégorie: </span>
                {product.categories.map(cat => (
                  <Link 
                    key={cat.id} 
                    to={`/products?category=${cat.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="mb-6">
              <span className="text-2xl font-bold text-blue-600">
                {product.price.toFixed(2)} €
              </span>
              {product.variants?.some(v => v.price !== product.price) && (
                <span className="text-sm text-gray-500 ml-2">
                  (Prix variable selon les options)
                </span>
              )}
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            {/* Options */}
            {product.options?.length > 0 && (
              <div className="mb-6">
                {product.options.map(option => (
                  <div key={option.id} className="mb-4">
                    <h3 className="font-medium mb-2">{option.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map(value => (
                        <button
                          key={value.id}
                          className="px-3 py-1 border rounded hover:bg-gray-100"
                        >
                          {value.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Variantes */}
            {product.variants?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Options disponibles</h3>
                <div className="space-y-2">
                  {product.variants.map(variant => (
                    <div key={variant.id} className="border p-3 rounded flex justify-between">
                      <div>
                        {variant.options?.map(opt => (
                          <span key={opt.id} className="mr-2">
                            {opt.value}
                          </span>
                        ))}
                      </div>
                      <span className="font-bold">{variant.price.toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition">
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Ici vous pourriez ajouter un appel à votre endpoint de recommendations */}
        </div>
      </div>
    </div>
  );
}