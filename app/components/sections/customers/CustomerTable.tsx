import { useEffect, useState } from "react";
import { Button } from "~/components/ui/Button";

type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  has_account?: boolean;
};

export default function CustomerTable() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      try {
        const res = await fetch("/api/customers");
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        } else {
          alert("Erreur lors du chargement des clients.");
        }
      } catch (error) {
        alert("Erreur réseau.");
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Liste des clients</h2>
        <Button to="/customers/new" variant="primary">Ajouter un client</Button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Nom</th>
              <th className="border border-gray-300 p-2 text-left">Prénom</th>
              <th className="border border-gray-300 p-2 text-left">Email</th>
              <th className="border border-gray-300 p-2 text-left">Téléphone</th>
              <th className="border border-gray-300 p-2 text-left">Compte</th>
              <th className="border border-gray-300 p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="border border-gray-300 p-2">{c.last_name}</td>
                <td className="border border-gray-300 p-2">{c.first_name}</td>
                <td className="border border-gray-300 p-2">{c.email || "-"}</td>
                <td className="border border-gray-300 p-2">{c.phone || "-"}</td>
                <td className="border border-gray-300 p-2">{c.has_account ? "Oui" : "Non"}</td>
                <td className="border border-gray-300 p-2">
                  <Button to={`/customers/${c.id}`} variant="secondary" className="mr-2">Voir</Button>
                  {/* Ici plus tard : Edit, Delete */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
