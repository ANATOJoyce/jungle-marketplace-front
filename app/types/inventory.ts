// Types de base
export interface Product {
  _id: string;
  name: string;
}

export interface StockLocation {
  _id: string;
  name: string;
}

export interface InventoryItem {
  sku: string;
  stock_quantity: number;
  product: Product;
  location?: StockLocation;
}

// Type Guards
export function isProduct(product: any): product is Product {
  return (
    typeof product === 'object' &&
    typeof product._id === 'string' &&
    typeof product.name === 'string'
  );
}

export function isStockLocation(location: any): location is StockLocation {
  return (
    typeof location === 'object' &&
    typeof location._id === 'string' &&
    typeof location.name === 'string'
  );
}

export function isInventoryItem(item: any): item is InventoryItem {
  return (
    typeof item === 'object' &&
    typeof item.sku === 'string' &&
    typeof item.stock_quantity === 'number' &&
    isProduct(item.product) &&
    (item.location === undefined || isStockLocation(item.location))
  );
}

export function isInventoryItemArray(items: any): items is InventoryItem[] {
  return Array.isArray(items) && items.every(isInventoryItem);
}