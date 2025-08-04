// utils/formatCurrency.ts
export function formatCurrency(amount: number, currencyCode: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100); // Si tu stockes en centimes (p.ex. 100 = 1.00)
}
