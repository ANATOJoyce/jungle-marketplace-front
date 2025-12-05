import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSearchParams, Form, Link } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { getSession } from "~/utils/session.server";

export type UserType = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
};

// ---------------------- ACTION ----------------------
export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  if (!token) return redirect("/login");

  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const userId = formData.get("userId");

  if (typeof actionType === "string" && typeof userId === "string") {
    if (actionType === "delete") {
      await fetch(`${process.env.PUBLIC_NEST_API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }


  }

  return redirect("/users");
};

// ---------------------- LOADER ----------------------
export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  if (!token) return redirect("/login");

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const perPage = parseInt(url.searchParams.get("perPage") || "10");
  const search = url.searchParams.get("search") || "";

  try {
    const res = await fetch(
      `${process.env.PUBLIC_NEST_API_URL}/users?page=${page}&limit=${perPage}&q=${search}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) throw new Error(`Erreur ${res.status}: ${await res.text()}`);

    const data = await res.json();
    return json({
      users: Array.isArray(data.users) ? data.users : [],
      count: data.count || (Array.isArray(data.users) ? data.users.length : 0),
    });
  } catch (error) {
    return json({
      users: [],
      count: 0,
      error: error instanceof Error ? error.message : "Erreur serveur inconnue",
    });
  }
};

// ---------------------- COMPONENT ----------------------
export default function UsersPage() {
  const data = useLoaderData<{
    users: UserType[];
    count: number;
    error?: string;
  }>();

  const users = data.users ?? [];
  const count = data.count ?? 0;
  const error = data.error;

  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "10");

  // Calcul des statistiques
  const totalUsers = count;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;
  const otherCount = users.filter(u => u.role !== 'admin' && u.role !== 'user').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion des Vendeurs</h1>
          <p className="text-gray-600">Gérez et surveillez tous les utilisateurs de votre plateforme</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Utilisateurs */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">Total Utilisateurs</p>
                <p className="text-4xl font-bold mt-2">{totalUsers}</p>
                <p className="text-orange-200 text-xs mt-2">Base complète</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Administrateurs */}
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium uppercase tracking-wide">Administrateurs</p>
                <p className="text-4xl font-bold mt-2">{adminCount}</p>
                <p className="text-slate-400 text-xs mt-2">Accès complet</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Utilisateurs */}
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 text-sm font-medium uppercase tracking-wide">Utilisateurs</p>
                <p className="text-4xl font-bold mt-2">{userCount}</p>
                <p className="text-gray-300 text-xs mt-2">Accès standard</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Autres Rôles */}
          <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">Autres Rôles</p>
                <p className="text-4xl font-bold mt-2">{otherCount}</p>
                <p className="text-orange-200 text-xs mt-2">Rôles personnalisés</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recherche */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200">
          <form method="get" className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  defaultValue={searchParams.get("search") || ""}
                  placeholder="Rechercher par nom, email, téléphone..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtrer
            </button>
          </form>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-5 mb-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-orange-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Tableau */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Prénom</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user.id} className={`hover:bg-orange-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.last_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.first_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-slate-100 text-slate-800' 
                            : user.role === 'user'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        {/* Supprimer */}
                        <Form method="post" className="inline">
                          <input type="hidden" name="actionType" value="delete" />
                          <input type="hidden" name="userId" value={user.id} />
                          <button
                            type="submit"
                            onClick={(e) => {
                              if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
                                e.preventDefault();
                              }
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors shadow-sm hover:shadow-md inline-flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Supprimer
                          </button>
                        </Form>

                        {/* Changer rôle */}
                        <Form method="post" className="inline">
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 text-sm font-medium transition-colors shadow-sm hover:shadow-md inline-flex items-center gap-1 ml-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Modifier
                          </button>
                        </Form>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">
                          {error ? "Erreur de chargement" : "Aucun utilisateur disponible"}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {error ? "Veuillez réessayer plus tard" : "Commencez par ajouter des utilisateurs"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {count > 0 && (
          <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 font-medium">
                Affichage de <span className="text-orange-600 font-bold">{(currentPage - 1) * perPage + 1}</span> à{" "}
                <span className="text-orange-600 font-bold">{Math.min(currentPage * perPage, count)}</span> sur{" "}
                <span className="text-orange-600 font-bold">{count}</span> utilisateurs
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to={`?page=${Math.max(1, currentPage - 1)}&perPage=${perPage}&search=${searchParams.get("search") || ""}`}
                  className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                    currentPage <= 1
                      ? 'text-gray-400 bg-gray-50 cursor-not-allowed border-gray-200'
                      : 'text-gray-700 hover:bg-orange-50 hover:border-orange-300 border-gray-300'
                  }`}
                  aria-disabled={currentPage <= 1}
                >
                  ← Précédent
                </Link>
                <span className="px-4 py-2 text-sm font-semibold text-gray-700 bg-orange-50 border border-orange-200 rounded-lg">
                  Page {currentPage} / {Math.ceil(count / perPage)}
                </span>
                <Link
                  to={`?page=${currentPage + 1}&perPage=${perPage}&search=${searchParams.get("search") || ""}`}
                  className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                    currentPage >= Math.ceil(count / perPage)
                      ? 'text-gray-400 bg-gray-50 cursor-not-allowed border-gray-200'
                      : 'text-gray-700 hover:bg-orange-50 hover:border-orange-300 border-gray-300'
                  }`}
                  aria-disabled={currentPage >= Math.ceil(count / perPage)}
                >
                  Suivant →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}