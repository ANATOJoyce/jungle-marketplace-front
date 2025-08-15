// app/routes/admin.dashboard.regions.new.tsx
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { getSession } from '~/utils/session.server';
import type { Country } from '~/types/country';

interface Region {
  id: string;
  name: string;
  currency_code: string;
  countries: Country[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));
  const token = session.get('token');

  if (!token) return json({ regions: [] });

  const res = await fetch(`${process.env.NEST_API_URL}/region`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const regions: Region[] = res.ok ? await res.json() : [];
  return json({ regions });
};

export default function CreateRegionForm() {
  const { regions } = useLoaderData<{ regions: Region[] }>();

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="mt-12 bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
        <h2 className="text-2xl font-semibold text-orange-900 mb-4">Liste des régions</h2>

        {regions.length === 0 ? (
          <p className="text-orange-700">Aucune région disponible.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-orange-200">
              <thead className="bg-orange-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-orange-800">Nom</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-orange-800">Devise</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-orange-800">Pays</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-orange-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-200">
                {regions.map(region => (
                  <tr key={region.id}>
                    <td className="px-6 py-4 text-orange-900">{region.name}</td>
                    <td className="px-6 py-4 text-orange-900">{region.currency_code}</td>
                    <td className="px-6 py-4 text-orange-900">
                      {region.countries.map(c => c.name).join(', ')}
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/admin/dashboard/regions/${region.id}`} className="text-orange-700 hover:text-orange-900">
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
