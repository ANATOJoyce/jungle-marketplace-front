import { Button } from "~/components/ui/Button";
import type { CustomerGroup } from "~/types/customer-group";

type CustomerGroupListProps = {
  groups: CustomerGroup[];
  isLoading?: boolean;
};

export default function CustomerGroupList({ 
  groups = [], 
  isLoading = false 
}: CustomerGroupListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Nom</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">ID</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Clients</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {groups.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-6 text-center text-gray-500">
                Aucun groupe de clients trouvé
              </td>
            </tr>
          ) : (
            groups.map((group) => (
              <tr key={group.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{group.name}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-sm">{group.id}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {group.customers?.length ?? 0}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-2">
                  <Button 
                    to={`/customers/groups/${group.id}`} 
                    variant="secondary" 
               
                  >
                    Détails
                  </Button>
                  <Button 
                    to={`/customers/groups/${group.id}/edit`} 
                    variant="primary" 
                  >
                    Modifier
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}