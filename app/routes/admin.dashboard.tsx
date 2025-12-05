import {
  Outlet,
  useLoaderData,
  useNavigation,
  useFetcher,
  Link,
  useLocation,
} from "@remix-run/react";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getSession } from "~/utils/session.server";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Store,
  User,
  ShoppingBag,
  Map,
  DollarSign,
  Tag,
  Truck,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import ProductCard from "~/components/sections/products/ProductCard";

/* ------------------ TYPES ------------------ */
interface JwtPayload {
  sub: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

interface LoaderData {
  token: string;
  user: JwtPayload;
  isAuthenticated: boolean;
}



/* ------------------ UTILS ------------------ */
function decodeJWT(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT format");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    if (payload.exp && payload.exp * 1000 < Date.now()) throw new Error("Token expired");
    return payload;
  } catch (error) {
    console.error("Erreur lors du décodage du JWT:", error);
    return null;
  }
}

/* ------------------ LOADER ------------------ */
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/login");

  const payload = decodeJWT(token);
  if (!payload) return redirect("/login");

  // Vérification du rôle
  if (payload.role !== "ADMIN") {
    return redirect("/"); // Redirige les non-admins vers la page d'accueil
  }

  return json<LoaderData>({
    token,
    user: payload,
    isAuthenticated: true,
  });
}


/* ------------------ UI COMPONENTS ------------------ */
function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-gray-900/75 flex items-center justify-center z-50">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
    </div>
  );
}

function ConnectionStatus({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl shadow-lg p-4 flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="text-yellow-600" />
        <span className="text-yellow-800 text-sm">Erreur de connexion</span>
      </div>
      <button
        onClick={onRetry}
        className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600"
      >
        Réessayer
      </button>
    </div>
  );
}

/* ------------------ PAGE PRINCIPALE ------------------ */
export default function AdminDashboardRoute() {
  const loaderData = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const fetcher = useFetcher();
  const location = useLocation();

  const [isOnline, setIsOnline] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const isLoading = navigation.state === "loading" || fetcher.state === "loading";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const navItems = [
    { path: "/admin/dashboard/stores", label: "Boutique", icon: <Store size={16} /> },
    { path: "/admin/dashboard/vendeur", label: "Vendeur", icon: <User size={16} /> },
    { path: "/admin/dashboard/regions", label: "Region", icon: <Map size={16} /> },
    { path: "/admin/dashboard/produits", label: "Produits", icon: <Store size={16} /> },

   
  ];

  return (
    <>
      {isLoading && <LoadingOverlay />}

      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h1 className="text-lg font-bold text-orange-500">Admin Panel</h1>
            <LayoutDashboard className="text-orange-500" />
          </div>

          <nav className="flex flex-col gap-1 p-2">
            {navItems.map(({ path, label, icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-orange-100 text-orange-600 font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {icon}
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Carte utilisateur juste au-dessus du bouton Déconnexion */}
          <div className="mt-auto px-3 pb-4">
            <div className="flex items-center gap-3 p-4 mb-4 rounded-2xl bg-gradient-to-r from-[#fff8ef] to-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#fbb344]/20">
                <User className="text-[#fbb344]" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {loaderData.user.first_name
                    ? `${loaderData.user.first_name} ${loaderData.user.last_name || ""}`
                    : "Utilisateur"}
                </p>
                <p className="text-xs text-gray-500">{loaderData.user.role || "Utilisateur"}</p>
              </div>
            </div>

          <Link
            to="/logout"
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:text-[#fbb344] hover:shadow-md hover:bg-white rounded-lg transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Tableau de bord administrateur
              </h2>
              <p className="text-sm text-gray-500">
                Gère les vendeurs, clients, et configurations globales.
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-orange-600">
                {loaderData.user.first_name || loaderData.user.role}
              </span>
            </div>
          </header>

          <section className="flex-1 p-6 overflow-y-auto">
            {!isOnline && (
              <ConnectionStatus onRetry={() => window.location.reload()} />
            )}

            {showSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 flex items-center gap-2">
                <CheckCircle size={18} /> Connexion rétablie
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <Outlet />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
