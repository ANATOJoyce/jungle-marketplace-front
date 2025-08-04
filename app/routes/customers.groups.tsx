import { useState } from "react";
import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import CustomerGroupForm from "~/components/sections/customers/CustomerGroupForm";
import { Button } from "~/components/ui/Button";
import CustomerGroupList from "~/components/sections/customers/CustomerGroupList";

// Définition du type avec SerializeFrom pour la sérialisation Remix
export type CustomerGroup = {
  id: string;
  name: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const res = await fetch(`${process.env.NEST_API_URL}/admin/customer-groups`, {
      headers: {
        'Authorization': `Bearer ${request.headers.get('Authorization')}`
      }
    });

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${res.statusText}`);
    }

    const groups: CustomerGroup[] = await res.json();
    return json({ groups });
  } catch (error) {
    throw new Response("Impossible de charger les groupes de clients", {
      status: 500,
      statusText: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};

export default function CustomerGroupsPage() {
  const { groups } = useLoaderData<typeof loader>();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Groupes de clients</h1>
        <Button 
          variant="primary" 
          onClick={() => setShowForm(true)}
        >
          Créer un groupe
        </Button>
      </div>

      {/* Conversion explicite du type avec SerializeFrom */}
      <CustomerGroupList groups={groups as SerializeFrom<CustomerGroup>[]} />

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
              aria-label="Fermer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold mb-4">Nouveau groupe</h2>
            <CustomerGroupForm 
              onSuccess={() => {
                setShowForm(false);
                // Optionnel: recharger les données ici si nécessaire
              }} 
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur !</strong>
        <span className="block sm:inline"> Impossible de charger les groupes de clients.</span>
      </div>
    </div>
  );
}