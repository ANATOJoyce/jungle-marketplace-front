import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/Button";

type DeleteCustomerButtonProps = {
  customerId: string;
};

export function DeleteCustomerButton({ customerId }: DeleteCustomerButtonProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleDelete() {
    if (!confirm("Voulez-vous vraiment supprimer ce client ?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        navigate("/customers");
      } else {
        alert("Échec de la suppression.");
      }
    } catch (err) {
      alert("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleDelete}
      variant="danger"
      className="mt-4"
    >
      {loading ? "Suppression..." : "Supprimer le client"}
    </Button>
  );
}
