// routes/dashboard.tsx
import { Outlet, useLoaderData } from "@remix-run/react";
import DashboardLayout from "~/components/layout/DashboardLayout";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getSession } from "~/utils/session.server"; // adapte le chemin selon ton projet

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  if (!token) {
    return redirect("/login");
  }
            
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  console.log(token, "token")
  return json({ token, user:payload, isAuthenticated:!!payload });
}

export default function DashboardRoute() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <DashboardLayout {...loaderData}>
      <Outlet />
    </DashboardLayout>
  );
}
