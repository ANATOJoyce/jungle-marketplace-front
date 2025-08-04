export function RecentSales({ data }: { data: Array<{name: string, email: string, amount: string}> }) {
  return (
    <div className="space-y-4">
      {data.map((sale, index) => (
        <div key={index} className="flex items-center justify-between">
          <div>
            <p className="font-medium">{sale.name}</p>
            <p className="text-sm text-gray-500">{sale.email}</p>
          </div>
          <div className="font-medium">{sale.amount}</div>
        </div>
      ))}
    </div>
  );
}