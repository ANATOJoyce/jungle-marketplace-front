import CustomerTable from "~/components/sections/customers/CustomerTable";

export default function CustomersPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Clients</h1>
      <CustomerTable />
    </div>
  );
}
