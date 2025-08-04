// app/routes/customers/index.tsx
import { useLoaderData, Form, useSearchParams } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  type: "registered" | "guest";
};

type LoaderData = {
  customers: Customer[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const filterType = url.searchParams.get("type") || "";

  // Appeler API backend pour chercher clients avec filtres
  let apiUrl = "http://localhost:3000/api/customers?";

  if (search) apiUrl += `search=${search}&`;
  if (filterType) apiUrl += `type=${filterType}&`;

  const res = await fetch(apiUrl);
  const customers: Customer[] = await res.json();

  return json<LoaderData>({ customers });
};

export default function Customers() {
  const { customers } = useLoaderData<LoaderData>();
  const [searchParams] = useSearchParams();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Customers</h1>

      <Form method="get" className="flex space-x-4 mb-6">
        <input
          type="text"
          name="search"
          placeholder="Search by name or email"
          defaultValue={searchParams.get("search") ?? ""}
          className="border rounded px-3 py-2 flex-grow"
        />
        <select
          name="type"
          defaultValue={searchParams.get("type") ?? ""}
          className="border rounded px-3 py-2"
        >
          <option value="">All Types</option>
          <option value="registered">Registered</option>
          <option value="guest">Guest</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Filter
        </button>
      </Form>

      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-4">
                No customers found.
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  window.location.href = `/customers/${customer.id}`;
                }}
              >
                <td className="border border-gray-300 px-4 py-2">
                  {customer.first_name} {customer.last_name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {customer.email}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {customer.type}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
