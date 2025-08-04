import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/Button";

// Définition du type dans un fichier séparé ou en haut du fichier
interface CustomerGroup {
  id: string;
  name: string;
  customerCount: number;
  createdAt: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const response = await fetch(`${process.env.NEST_API_URL}/customer-groups`);
    
    if (!response.ok) {
      return json({ error: "Failed to fetch customer groups" }, { status: 400 });
    }

    const data = await response.json();
    
    // Transformation des données pour correspondre à l'interface
    const groups: CustomerGroup[] = data.map((group: any) => ({
      id: group.id,
      name: group.name,
      customerCount: group.customers?.length || 0,
      createdAt: new Date(group.created_at).toLocaleDateString(),
    }));

    return json({ groups });
  } catch (error) {
    return json({ error: "Server error" }, { status: 500 });
  }
}

export default function CustomerGroupsPage() {
  const loaderData = useLoaderData<typeof loader>();
  
  // Vérification du type au runtime
  if ('error' in loaderData) {
    return <div className="p-6 text-red-600">Error: {loaderData.error}</div>;
  }

  const { groups } = loaderData;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Groupes de Clients</h1>

      {/* Liste des groupes avec typage correct */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clients
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {groups.map((group: CustomerGroup) => (
              <tr key={group.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {group.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {group.customerCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <Button
                    to={`/customer-groups/${group.id}`}
                    variant="secondary"
                    size="sm"
                  >
                    Détails
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}