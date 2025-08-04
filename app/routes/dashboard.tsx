import { Outlet } from "@remix-run/react";
import DashboardLayout from "~/components/layout/DashboardLayout";

export default function DashboardRoute() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
