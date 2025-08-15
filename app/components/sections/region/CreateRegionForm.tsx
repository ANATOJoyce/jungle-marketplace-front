type Props = {
  countries: {   id: string;            // correspond à _id mongoose
    iso_2: string;         // code iso 2 lettres
    iso_3: string;         // code iso 3 lettres
    num_code: string;      // code numérique
    name: string;          // nom (indexé)
    display_name: string;  // nom complet affiché
    region?: string;  // id ou objet Region référencé
    metadata?: Record<string, unknown>; }[];
};

export default function CreateRegionForm({ countries }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nom de la région</label>
        <input type="text" name="name" className="w-full border px-3 py-2 rounded" required />
      </div>

      <div>
        <label className="block text-sm font-medium">Devise</label>
        <input type="text" name="currency_code" className="w-full border px-3 py-2 rounded" required />
      </div>

      <div>
        <label className="block text-sm font-medium">Pays</label>
        <select
          name="countryIds"
          multiple
          className="w-full border px-3 py-2 rounded h-40"
          required
        >
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.iso_2.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="automatic_taxes" />
          Taxes automatiques
        </label>
      </div>
    </div>
  );
}
