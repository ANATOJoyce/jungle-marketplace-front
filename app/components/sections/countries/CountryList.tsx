import { Country,  Region } from "~/types/country";

interface CountryListProps {
  countries: Country[];
  regions: Region[];
  onEdit: (country: Country) => void;
  onDelete: (id: string) => void;
}

export function CountryList({ countries, regions, onEdit, onDelete }: CountryListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2">ISO 2</th>
            <th className="px-4 py-2">Nom</th>
            <th className="px-4 py-2">Région</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {countries.map((country) => (
            <tr key={country.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-center">{country.iso_2}</td>
              <td className="px-4 py-2">{country.name}</td>
              <td className="px-4 py-2">
                {regions.find(r => r.id === country.region?.id)?.name || '-'}
              </td>
              <td className="px-4 py-2 space-x-2 text-center">
                <button
                  onClick={() => onEdit(country)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(country.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}