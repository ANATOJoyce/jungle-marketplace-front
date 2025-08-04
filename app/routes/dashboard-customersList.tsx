import { useLoaderData, Link } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  groups: string[];
  created_at: string;
};

export const loader = async () => {
  try {
    const response = await fetch("http://localhost:3000/customer");
    if (!response.ok) {
      throw new Error("Erreur de réponse : " + response.status);
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur dans le loader :", error);
    throw new Response("Impossible de charger les clients", { status: 500 });
  }
};


export default function CustomersPage() {
  const { customers } = useLoaderData<{ customers: Customer[] }>();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Customers List</h1>

      <Link
        to="/customer/create"
        className="inline-block mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + Add Customer
      </Link>

      <table className="min-w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-6 py-3">Name</th>
            <th className="text-left px-6 py-3">Email</th>
            <th className="text-left px-6 py-3">Groups</th>
            <th className="text-left px-6 py-3">Created At</th>
            <th className="text-left px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-6 text-gray-500">
                No customers found.
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr key={customer.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  {customer.first_name} {customer.last_name}
                </td>
                <td className="px-6 py-4">{customer.email}</td>
                <td className="px-6 py-4">
                  {customer.groups.length > 0
                    ? customer.groups.join(", ")
                    : "-"}
                </td>
                <td className="px-6 py-4">
                  {new Date(customer.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <Link
                    to={`/customer/${customer.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
