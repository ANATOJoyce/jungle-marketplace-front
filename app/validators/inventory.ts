// Définition des interfaces
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

// Type guards
export function isProduct(obj: any): obj is Product {
  return (
    obj &&
    typeof obj._id === 'string' &&
    typeof obj.name === 'string'
  );
}

export function isStockLocation(obj: any): obj is StockLocation {
  return (
    obj &&
    typeof obj._id === 'string' &&
    typeof obj.name === 'string'
  );
}

export function isInventoryItem(obj: any): obj is InventoryItem {
  return (
    obj &&
    typeof obj.sku === 'string' &&
    typeof obj.stock_quantity === 'number' &&
    isProduct(obj.product) &&
    (obj.location === undefined || isStockLocation(obj.location))
  );
}

export function validateInventoryItems(items: any): items is InventoryItem[] {
  if (!Array.isArray(items)) return false;
  return items.every(isInventoryItem);
}