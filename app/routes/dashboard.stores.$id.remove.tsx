import { useLoaderData, useNavigate, Form } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getSession } from "~/utils/session.server";
import { Button } from "~/components/ui/Button";

/* ------------------- LOADER ------------------- */
export const loader: LoaderFunction = async ({ params, request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  if (!token) return redirect("/login");

  const res = await fetch(`${process.env.PUBLIC_NEST_API_URL}/store/${params.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Response("Boutique introuvable", { status: 404 });
  return json(await res.json());
};

/* ------------------- ACTION ------------------- */
export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  const res = await fetch(`${process.env.PUBLIC_NEST_API_URL}/store/${params.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return json({ error: data.message || "Erreur lors de la suppression" }, { status: 400 });
  }

  return redirect("/dashboard/setting/store");
};

/* ------------------- COMPONENT ------------------- */
export default function DeleteStoreModal() {
  const store = useLoaderData<any>();
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      {/* Carte du pop-up */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6">
        <h2 className="text-xl font-bold text-center text-red-600">
          Supprimer la boutique
        </h2>

        <p className="text-center">
          Voulez-vous vraiment supprimer la boutique{" "}
          <span className="font-semibold">{store.name}</span> ?
          <br />
          Cette action est{" "}
          <span className="text-red-600 font-bold">irréversible</span>.
        </p>

        <Form method="post" className="flex gap-4 justify-center pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Annuler
          </Button>
          <Button type="submit" variant="destructive">
            Supprimer
          </Button>
        </Form>
      </div>
    </div>
  );
}
