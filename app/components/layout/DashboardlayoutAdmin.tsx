// app/components/layouts/DashboardLayout.tsx
import { Link } from "@remix-run/react";
import { Bell, LogOut } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { Logo } from "~/components/auth/logo";

type DashboardLayoutProps = {
  token: string;
  children: ReactNode;
};

export function DashboardlayoutAdmin({ token, children }: DashboardLayoutProps) {
  const [store, setStore] = useState<any>(null);
  const [notifications] = useState(3);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch(`${window.ENV.PUBLIC_NEST_API_URL}/region`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erreur serveur");

        const data = await res.json();
        setStore(data);
      } catch (err) {
        console.error("Erreur dashboard layout:", err);
      }
    };

    fetchStore();
  }, [token]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col gap-4">
        <Logo />
        <nav className="flex flex-col gap-1 p-2">
          <Link to="/admin/dashboard/stores" className="px-3 py-2 rounded-md hover:bg-gray-100 hover:text-orange-500 transition-colors">Boutique</Link>
          <Link to="/admin/dashboard/vendeur" className="px-3 py-2 rounded-md hover:bg-gray-100 hover:text-orange-500 transition-colors">Vendeur</Link>
          <Link to="/admin/dashboard/customer/index" className="px-3 py-2 rounded-md hover:bg-gray-100 hover:text-orange-500 transition-colors">Customer</Link>
          <Link to="/admin/dashboard/regions/new" className="px-3 py-2 rounded-md hover:bg-gray-100 hover:text-orange-500 transition-colors">Region</Link>
          <Link to="/region-manage" className="px-3 py-2 rounded-md hover:bg-gray-100 hover:text-orange-500 transition-colors">Tax Region</Link>
          <Link to="/sales-channels" className="px-3 py-2 rounded-md hover:bg-gray-100 hover:text-orange-500 transition-colors">Sales Channels</Link>
          <Link to="/product-types" className="px-3 py-2 rounded-md hover:bg-gray-100 hover:text-orange-500 transition-colors">Product Types</Link>
          <Link to="/product-tags" className="px-3 py-2 rounded-md hover:bg-gray-100 hover:text-orange-500 transition-colors">Product Tags</Link>
          <Link to="/locations-shipping" className="px-3 py-2 rounded-md hover:bg-gray-100 hover:text-orange-500 transition-colors">Locations & Shipping</Link>
        </nav>
        <div className="mt-auto pt-6 border-t">
          <Link to="/logout" className="flex items-center gap-2 text-red-500 hover:underline">
            <LogOut size={16} /> Déconnexion
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-white border-b">
          <div className="flex items-center gap-4">
            {store?.logo && (
              <img
                src="/Jungle_logo05"
                alt="Logo"
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <h1 className="text-lg font-semibold">
              {store?.name || "Tableau de bord"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell size={20} className="text-gray-600" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1">
                  {notifications}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
