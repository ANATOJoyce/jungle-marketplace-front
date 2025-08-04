import CustomerForm from "~/components/sections/customers/CustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Créer un nouveau client</h1>
      <CustomerForm />
    </div>
  );
}
