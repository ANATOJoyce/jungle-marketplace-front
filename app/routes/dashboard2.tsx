// routes/dashboard.tsx
import { Outlet, useLoaderData, useNavigation, useFetcher } from "@remix-run/react";
import DashboardLayout from "~/components/layout/DashboardLayout";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { requireUserToken } from "~/utils/auth.server";
import { AlertTriangle, WifiOff, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

// Types
interface JwtPayload {
  sub: string;
  email: string;
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}

interface Store {
  _id: string;
  id: string;
  name: string;
  status: string;
  default_sales_channel_id?: string;
  default_region_id?: string;
  default_location_id?: string;
  createdAt: string;
  updatedAt: string;
}

interface LoaderData {
  token: string;
  user: JwtPayload;
  isAuthenticated: boolean;
  currentStore: Store | null;
  error?: string;
  storeLoadError?: boolean;
}

// Charge la boutique active
async function loadCurrentStore(storeId: string, token: string): Promise<{ store: Store | null; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${process.env.NEST_API_URL}/store/${storeId}`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 404) return { store: null, error: "Boutique non trouvée" };
      if (res.status === 403) return { store: null, error: "Accès non autorisé à cette boutique" };
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      store: {
        _id: data._id || data.id,
        id: data.id || data._id,
        name: data.name || "Boutique sans nom",
        status: data.status || "unknown",
        default_sales_channel_id: data.default_sales_channel_id,
        default_region_id: data.default_region_id,
        default_location_id: data.default_location_id,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      },
    };
  } catch (err: any) {
    console.error("Erreur lors du chargement de la boutique:", err);
    return { store: null, error: err.name === "AbortError" ? "Timeout lors du chargement de la boutique" : err.message };
  }
}

// Loader
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { token, headers } = await requireUserToken(request);
    const currentStoreId = new URL(request.url).searchParams.get("storeId");

    // Décoder le payload JWT
    const payload: JwtPayload = jwtDecode(token);

    let currentStore: Store | null = null;
    let storeLoadError = false;
    let errorMessage: string | undefined;

    if (currentStoreId) {
      const { store, error } = await loadCurrentStore(currentStoreId, token);
      if (error) {
        storeLoadError = true;
        errorMessage = error;
      } else if (store && store.status !== "active") {
        storeLoadError = true;
        errorMessage = "Cette boutique est désactivée";
      } else if (store) {
        currentStore = store;
      }
    }

    const responseHeaders = new Headers();
    if (headers?.["Set-Cookie"]) {
      responseHeaders.set("Set-Cookie", headers["Set-Cookie"]);
    }

    return json<LoaderData>(
      {
        token,
        user: payload,
        isAuthenticated: true,
        currentStore,
        storeLoadError,
        error: errorMessage,
      },
      { headers: responseHeaders }
    );
  } catch (err) {
    console.error("Erreur loader dashboard:", err);
    return redirect("/login?error=session_error");
  }
}

// Composants UI
function ConnectionStatus({ error, onRetry }: { error?: string; onRetry: () => void }) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!isOnline)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center space-x-3">
        <WifiOff className="text-red-500 flex-shrink-0" size={20} />
        <div className="flex-1">
          <p className="text-red-800 font-medium">Connexion internet indisponible</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-center space-x-3">
        <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
        <div className="flex-1">
          <p className="text-yellow-800 font-medium">Problème de chargement</p>
          <p className="text-yellow-700 text-sm">{error}</p>
        </div>
        <button
          onClick={onRetry}
          className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1"
        >
          <RefreshCw size={14} />
          <span>Réessayer</span>
        </button>
      </div>
    );

  return null;
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full"></div>
        <p className="text-gray-600 font-medium">Chargement en cours...</p>
      </div>
    </div>
  );
}

// Composant principal
export default function DashboardRoute() {
  const loaderData = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const fetcher = useFetcher();

  const [showError, setShowError] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handle = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handle);
    window.addEventListener("offline", handle);
    return () => {
      window.removeEventListener("online", handle);
      window.removeEventListener("offline", handle);
    };
  }, []);

  const isLoading = navigation.state === "loading" || fetcher.state === "loading";
  const handleRetryStoreLoad = () => window.location.reload();

  return (
    <>
      {isLoading && <LoadingOverlay />}
      <DashboardLayout {...loaderData}>
        {showError && (loaderData.error || !isOnline) && (
          <div className="container mx-auto px-4 pt-4">
            <ConnectionStatus error={loaderData.error} onRetry={handleRetryStoreLoad} />
          </div>
        )}
        <Outlet />
      </DashboardLayout>
    </>
  );
}
