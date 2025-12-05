import { Link, useLocation, useNavigate, useLoaderData } from "@remix-run/react";
import {
  Bell,
  LogOut,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  HouseIcon,
  icons,
  User
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Logo } from "../auth/logo";
import { loader } from "~/routes/dashboard";
import { Avatar } from "../ui/avatar";
import { Label } from "recharts";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { token: accessToken, user, isAuthenticated, currentStore } = useLoaderData<typeof loader>();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();
  const isInSettings = location.pathname.startsWith("/dashboard/settings");

  const navigationItems = [
    { to: `/dashboard/stores/${currentStore?._id}/stats`, label: "Tableau de bord", icon: LayoutDashboard },
    { to: `/dashboard/stores/${currentStore?.id}/products`, label: "Produits", icon: Package },
    { to: `/dashboard/stores/${currentStore?.id}/categories`, label: "Categorie", icon: HouseIcon },
    { to: `/dashboard/stores/${currentStore?.id}/collection`, label: "Collection", icon: HouseIcon },
    { to: `/dashboard/stores/${currentStore?.id}/promotions`, label: "Promotions", icon: Package },
    { to: `/dashboard/stores/${currentStore?._id}/orders`, label: "Commandes", icon: ShoppingCart },
    { to: "/dashboard", label: "Price Liste", icon: HouseIcon },
    {to: `/dashboard/stores/${currentStore?._id}/customer`, label: "Clients", icon: User},
   


  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="p-6 bg-white">
          <Logo />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-black hover:text-[#fbb344] hover:shadow-md hover:bg-white transition-all duration-200"
              >
                <IconComponent size={20} className="text-[#fbb344]" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          <div
            onMouseEnter={() => setSettingsOpen(true)}
            onMouseLeave={() => setSettingsOpen(false)}
            className="relative"
          >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg text-black transition-all duration-200 ${
              isInSettings ? "text-[#fbb344] font-semibold shadow-md" : "hover:text-[#fbb344] hover:shadow-md hover:bg-white"
            }`}>
              <Settings size={20} className="text-[#fbb344]" />
              <span className="font-medium">Paramètres </span>
            </div>

            {settingsOpen && (
              <div className=" w-48 ml-2 bg-white shadow-lg rounded-md z-50">
                <Link
                  to="/dashboard/setting/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#fbb344] hover:text-white transition"
                >
                  Mon Profil
                </Link>
                <Link
                  to="/dashboard/setting/store"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#fbb344] hover:text-white transition"
                >
                  Créer une boutique
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 bg-white">
          {user && (
       <div className="flex items-center gap-3 p-4 mb-4 rounded-2xl bg-gradient-to-r from-[#fff8ef] to-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          {/* Avatar / Icône boutique */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#fbb344]/20">
            <User className="text-[#fbb344]" size={20} />
          </div>

          {/* Infos utilisateur / boutique */}
          <div className="flex-1 min-w-0">
           
            <td className="px-6 py-4 text-gray-700">
           {/* Infos utilisateur / boutique */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {currentStore?.name ?? `${user.first_name} ${user.last_name ?? ""}`}
              </p>
              <p className="text-xs text-gray-500">
                {currentStore ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="capitalize">{currentStore.status}</span>
                  </span>
                ) : (
                  user.role ?? "Utilisateur"
                )}
              </p>

              {/* Affichage du pays avec drapeau */}
              {currentStore?.country ? (
                <div className="flex items-center gap-2 mt-1">
                  <img
                    src={`https://flagcdn.com/16x12/${currentStore.country.iso2.toLowerCase()}.png`}
                    alt={currentStore.country.name}
                    className="w-4 h-3 rounded-sm"
                  />
                  <span>{currentStore.country.name}</span>
                </div>
              ) : null}
            </div>

            </td>

          </div>

        </div>

          )}

          <Link
            to="/logout"
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:text-[#fbb344] hover:shadow-md hover:bg-white rounded-lg transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
    <main className="flex-1 flex flex-col">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex justify-between items-center p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#fbb344] rounded-lg">
                <LayoutDashboard size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#fbb344]">
                  Bienvenue {user.first_name}
                </h1>
                <p className="text-sm text-gray-500">
                  Boutique active : {currentStore?.name || "Aucune boutique sélectionnée"}
                </p>
                <p className="text-sm text-gray-500">Pays : {currentStore?.country?.name || "Non défini"}</p>

              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto bg-white">{children}</div>
      </main>
    </div>
  );
}
