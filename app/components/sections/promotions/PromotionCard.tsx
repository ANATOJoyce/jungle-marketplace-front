// PromotionCard.tsx
export function PromotionCard({ promotion }: { promotion: any }) {
  const getPromotionType = () => {
    if (promotion.type === "percentage") return `${promotion.value}% de réduction`;
    if (promotion.type === "fixed") return `${promotion.value}€ de réduction`;
    if (promotion.type === "buy_x_get_y") return `Achetez ${promotion.buy_quantity} obtenez ${promotion.get_quantity}`;
    return "Promotion";
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
      <div className="flex justify-between">
        <h3 className="font-medium text-lg">{promotion.name}</h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          {promotion.status}
        </span>
      </div>
      <p className="text-gray-600 mt-1">{getPromotionType()}</p>
      <div className="mt-3 text-sm text-gray-500">
        <p>Valide du {new Date(promotion.start_date).toLocaleDateString()} au {new Date(promotion.end_date).toLocaleDateString()}</p>
        {promotion.budget && <p>Budget: {promotion.budget}€</p>}
      </div>
    </div>
  );
}