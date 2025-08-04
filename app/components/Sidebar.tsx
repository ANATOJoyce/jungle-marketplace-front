// app/components/Sidebar.tsx
import { Link, useLocation } from "@remix-run/react";
import { Home, Settings, Users, Tag, PercentCircle } from "lucide-react";

const navLinks = [
  { name: "Store", to: "/store", icon: Home },
  { name: "Customers", to: "/dashboard/customers", icon: Users },
  { name: "Promotions", to: "/dashboard/promotion", icon: PercentCircle },
  { name: "Price Lists", to: "/dashboard/price-lists", icon: Tag },
  { name: "Settings", to: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="h-16 flex items-center justify-center text-2xl font-bold border-b">Vendor
      </div>
      <nav className="p-4 space-y-2">
        {navLinks.map(({ name, to, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <Link
              key={name}
              to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${
                active ? "bg-gray-200 font-medium" : ""
              }`}
            >
              <Icon className="w-5 h-5" />
              {name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
