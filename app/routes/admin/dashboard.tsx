
/*/// app/routes/admin/dashboard.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserRole } from "~/utils/session.server";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserRole(request, "ADMIN"); // redirect si pas admin
  return json({ user });
};

export default function AdminDashboard() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Dashboard Admin</h1>
      <p>Bienvenue {user.firstName} </p>
      {/* Tu peux afficher ici les statistiques, gestion des vendeurs, etc. }
    </div>
  );
}
*/