import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/Button";

type CustomerFormProps = {
  customer?: Partial<Customer>; // pour l'édition
};

type Customer = {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  has_account?: boolean;
};

export default function CustomerForm({ customer }: CustomerFormProps) {
  const navigate = useNavigate();

  const [form, setForm] = useState<Customer>({
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    has_account: customer?.has_account || false,
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const method = customer?.email ? "PUT" : "POST";
      const url = customer?.email
        ? `/api/customers/${customer.email}`
        : "/api/customers";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        navigate("/customers");
      } else {
        alert("Erreur lors de l’enregistrement.");
      }
    } catch (err) {
      alert("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium">Nom</label>
        <input
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Prénom</label>
        <input
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Téléphone</label>
        <input
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="has_account"
          checked={form.has_account}
          onChange={handleChange}
          className="h-4 w-4"
        />
        <label htmlFor="has_account">Ce client possède un compte</label>
      </div>

      <div className="pt-4">
        <Button  variant="primary">
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
