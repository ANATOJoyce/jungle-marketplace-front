import { Link, useLocation } from "@remix-run/react";
import { Logo } from "../auth/logo";

const navItems = [
  { name: "Tableau de bord", path: "/dashboard", icon: "dashboard" },
  { name: "Produits", path: "/products", icon: "inventory_2" },
  { name: "Commandes", path: "/orders", icon: "shopping_cart" },
  { name: "Clients", path: "/customers", icon: "groups" },
  { name: "Promotions", path: "/promotions", icon: "local_offer" },
  { name: "Paramètres", path: "/settings", icon: "settings" },
];

export function Sidebar() {
  const location = useLocation();

  function cn(arg0: string, arg1: string): string | undefined {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="hidden border-r bg-gray-50 md:block w-64 fixed h-full">
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="py-4">
          <Logo />
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 transition-all",
                    location.pathname === item.path
                      ? "bg-orange-100 text-orange-600"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <span className="material-icons">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="mt-auto p-4">
          <p className="text-sm text-gray-500">
            © 2023 MonCommerce. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}