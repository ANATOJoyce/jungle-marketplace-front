import React from "react";
import { Link } from "@remix-run/react";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  images: string[];
  categories?: { id: string; name: string }[];
  variants?: { id: string; price: number }[];
}

interface ProductCardProps {
  product: Product;
  onStatusChange?: (id: string, status: string) => void;
}

export default function ProductCard({ product, onStatusChange }: ProductCardProps) {
  const variants = product.variants || [];
  const lowestPrice = variants.reduce(
    (min, variant) => (variant.price < min ? variant.price : min),
    product.price
  );

  const handlePropose = () => {
    if (onStatusChange) {
      onStatusChange(product.id, "proposed");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
      <Link to={`/products/${product.id}`}>
        {product.images?.length ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Pas d'image</span>
          </div>
        )}

        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">{product.title}</h2>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-blue-600">
              {lowestPrice.toFixed(2)} €
              {variants.length > 1 &&
                variants.some((v) => v.price !== lowestPrice) && (
                  <span className="text-xs text-gray-500 ml-1">à partir de</span>
                )}
            </span>

            {product.categories && product.categories.length > 0 && (
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                {product.categories[0].name}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Bouton proposer visible côté vendeur */}
      <button
        onClick={handlePropose}
        className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
      >
        Proposer
      </button>
    </div>
  );
}
