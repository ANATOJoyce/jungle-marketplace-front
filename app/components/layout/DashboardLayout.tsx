import { Link, useLocation, useNavigate } from "@remix-run/react";
import {
  Bell,
  LogOut,
  LayoutDashboard,
  Package,
  Folder,
  Grid3X3,
  ShoppingCart,
  CreditCard,
  Settings,
  User
} from "lucide-react";
import { useEffect, useState, ReactNode } from "react";
import { Logo } from "../auth/logo";
import { useAuth } from "~/hooks/useAuth";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [store, setStore] = useState<any>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth(); // ⬅️ récupération de `loading`

  const isInSettings = location.pathname.startsWith("/dashboard/settings");

  const navigationItems = [
    { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { to: "/dashboard/products", label: "Produits", icon: Package },
    { to: "/dashboard/promotions", label: "Promotions", icon: Package },
    { to: "/dashboard/categories", label: "Catégories", icon: Folder },
    { to: "/dashboard/collections", label: "Collections", icon: Grid3X3 },
    { to: "/dashboard/order", label: "Commandes", icon: ShoppingCart },
    { to: "/dashboard/payment", label: "Paiement", icon: CreditCard },
  ];

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    const fetchStore = async () => {
      try {
        const res = await fetch(`${window.ENV.PUBLIC_NEST_API_URL}/store/me`, {
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

    if (token && isAuthenticated) {
      fetchStore();
    }
  }, [isAuthenticated]);

  if (loading) {
    return <div className="p-10 text-center text-gray-600 text-lg">Chargement...</div>;
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
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
              <span className="font-medium">Paramètres</span>
            </div>

            {settingsOpen && (
              <div className="absolute left-full top-0 w-48 ml-2 bg-white shadow-lg rounded-md z-50">
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
            <div className="flex items-center gap-3 p-3 mb-3 rounded-lg bg-white shadow-sm">
              {store?.logo ? (
                <img
                  src={store.logo}
                  alt="Store Logo"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#fbb344] flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {store?.name || `${user.first_name} ${user.last_name}`}
                </p>
                <p className="text-xs text-gray-500">{user.role}</p>
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
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#fbb344] rounded-lg">
                <LayoutDashboard size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#fbb344]">
                  {store?.name || "Tableau de bord"}
                </h1>
                <p className="text-sm text-gray-500">Gérez votre boutique en ligne</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative cursor-pointer">
                <div className="p-3 bg-[#fbb344] bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors duration-200">
                  <Bell size={20} className="text-[#fbb344]" />
                </div>
              </div>

              {store?.logo && (
                <div className="relative">
                  <img
                    src={store.logo}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto bg-white">
          {children}

          {/* Exemple de lien pour une commande spécifique */}
       
        </div>
      </main>
    </div>
  );
}
