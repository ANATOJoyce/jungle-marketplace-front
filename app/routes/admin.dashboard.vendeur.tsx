import { json } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { User } from "~/types/user";

// Définition du type User avec toutes les propriétés nécessaires


export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const perPage = parseInt(url.searchParams.get("perPage") || "10");
  const search = url.searchParams.get("search") || "";

  try {
    const res = await fetch(
      `${process.env.NEST_API_URL}/users`
    );

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    
    // Normalisation des données utilisateur
    const users = (Array.isArray(data.users) ? data.users.map((user: any) => ({
      id: user.id,
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role || 'USER',
      isActive: user.isActive ?? true, // Valeur par défaut true si non spécifié
      // Ajoutez d'autres propriétés au besoin
    })) : []);

    return json({
      users,
      count: data.count || 0,
    });

  } catch (error) {
    return json(
      { 
        users: [], 
        count: 0, 
        error: error instanceof Error ? error.message : "Erreur serveur" 
      },
      { status: 500 }
    );
  }
};

export default function UsersList() {
  const { users, count, error } = useLoaderData<{
    users: User[];
    count: number;
    error?: string;
  }>();
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "10");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... (le reste de l'en-tête et de la recherche reste identique) ... */}

      {/* Tableau des utilisateurs */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.first_name} {user.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.last_name ?? true // Utilisation de l'opérateur de coalescence nulle
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.last_name ?? true ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/users/${user.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Voir
                        </Link>
                        <Link
                          to={`/users/${user.id}/edit`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Éditer
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    {error ? "Erreur de chargement" : "Aucun utilisateur trouvé"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ... (le reste de la pagination reste identique) ... */}
    </div>
  );
}