import { Currency } from "~/types/currency";
import { Region } from "~/types/region";

interface RegionListProps {
  regions: Region[];
  currencies: Currency[];
  onEdit: (region: Region) => void;
  onDelete: (id: string) => void;
  onCountrySelect: (region: Region) => void;
}

export function RegionList({ regions, currencies, onEdit, onDelete, onCountrySelect }: RegionListProps) {
  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <table className="min-w-full">
        {/* ... table headers ... */}
        <tbody className="divide-y divide-gray-200">
          {regions.map((region) => {
            const currency = currencies.find(c => c.code === region.currency_code);
            return (
              <tr key={region.id}>
                {/* ... other cells ... */}
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => onEdit(region)}
                    className="text-blue-600 underline"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => onDelete(region.id)}
                    className="text-red-600 underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}