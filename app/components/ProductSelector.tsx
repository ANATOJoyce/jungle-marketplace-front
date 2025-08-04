import { Checkbox } from "~/components/Checkbox";

interface Product {
  id: string;
  name: string;
}

interface ProductSelectorProps {
  products: Product[];
  selectedProducts: string[];
  onSelect: (selectedIds: string[]) => void;
}

export function ProductSelector({
  products,
  selectedProducts, 
  onSelect
}: ProductSelectorProps) {
  const toggleProduct = (productId: string) => {
    const newSelection = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId];
    onSelect(newSelection);
  };

  return (
    <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
      {products.map(product => (
        <div key={product.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50">
            <Checkbox
            id={`product-${product.id}`}
            checked={selectedProducts.includes(product.id)}
            onChange={() => toggleProduct(product.id)}
            />
          <label htmlFor={`product-${product.id}`} className="text-sm">
            {product.name}
          </label>
        </div>
      ))}
    </div>
  );
}