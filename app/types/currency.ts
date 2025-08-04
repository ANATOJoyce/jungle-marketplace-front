export interface Currency {
  id: string;           // correspond à _id mongoose
  code: string;         // ex: "USD"
  symbol: string;       // ex: "$"
  symbol_native: string;// ex: "$"
  name: string;         // ex: "US Dollar"
  decimal_digits: number; // nombre de décimales
  rounding: number;       // arrondi, nombre fini
}
