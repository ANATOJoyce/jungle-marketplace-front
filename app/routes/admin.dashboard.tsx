import { LoaderFunctionArgs } from "@remix-run/node";
import { json, Outlet, redirect, useLoaderData } from "@remix-run/react";
import { DashboardlayoutAdmin } from "~/components/layout/DashboardlayoutAdmin";
import { getSession } from "~/utils/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) throw redirect("/login");

  return json({ token });
};

export default function AdminPage() {
  const { token } = useLoaderData<typeof loader>();

  return (
    <DashboardlayoutAdmin token={token}>
      <p>Bienvenue dans l’admin !</p>
      <Outlet></Outlet>
    </DashboardlayoutAdmin>
  );
}
