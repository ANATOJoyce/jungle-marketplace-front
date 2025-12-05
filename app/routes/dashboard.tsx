// routes/dashboard.tsx
import { Outlet, useLoaderData, useNavigation, useFetcher } from "@remix-run/react";
import DashboardLayout from "~/components/layout/DashboardLayout";
import { ActionFunction, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { commitSession, getSession } from "~/utils/session.server";
import { useEffect, useState } from "react";
import { 
  AlertTriangle, WifiOff, RefreshCw, CheckCircle, XCircle, Clock, Globe 
} from "lucide-react";

// --- Types ---
interface JwtPayload {
  sub: string;
  email: string;
  first_name?: string;
  last_name?: string;
  iat?: number;
  exp?: number;
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
  
  // 🔹 Champs pour le pays et la devise
  country?: {
    _id: string;
    name: string;
    currency_code: string;
    iso2: string;

  };
}


interface LoaderData {
  token: string;
  user: JwtPayload;
  isAuthenticated: boolean;
  currentStore: Store | null;
  error?: string;
  storeLoadError?: boolean;
}

// --- Helpers ---
function decodeJWT(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

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
      if (res.status === 403) return { store: null, error: "Accès non autorisé" };
      throw new Error(`HTTP ${res.status}`);
    }

    const storeData = await res.json();
    return { store: {
      _id: storeData._id || storeData.id,
      id: storeData.id || storeData._id,
      name: storeData.name || "Boutique sans nom",
      status: storeData.status || "unknown",
      default_sales_channel_id: storeData.default_sales_channel_id,
      default_region_id: storeData.default_region_id,
      default_location_id: storeData.default_location_id,
      createdAt: storeData.createdAt || new Date().toISOString(),
      updatedAt: storeData.updatedAt || new Date().toISOString(),
    }};
  } catch (error: any) {
    if (error.name === "AbortError") return { store: null, error: "Timeout lors du chargement" };
    return { store: null, error: error.message || "Erreur inconnue" };
  }
}

// --- Loader ---
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const currentStoreId = session.get("currentStoreId");

  if (!token) return redirect("/login");
  const payload = decodeJWT(token);
  if (!payload) return redirect("/login");

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

  return json<LoaderData>({
    token,
    user: payload,
    isAuthenticated: true,
    currentStore,
    storeLoadError,
    error: errorMessage,
  });
}

// --- Action (changer la boutique active) ---
export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const storeId = params.storeId;
  if (!storeId) throw new Response("ID de boutique manquant", { status: 400 });

  try {
    const res = await fetch(`${process.env.NEST_API_URL}/store/${storeId}`, { headers: { cookie: request.headers.get("cookie") || "" } });
    if (!res.ok) return json({ error: "Impossible de récupérer la boutique" }, { status: res.status });
    const store = await res.json();
    if (store.status !== "active") return json({ error: "Boutique inactive" }, { status: 403 });

    session.set("currentStoreId", storeId);
    return json({ message: `Connecté à "${store.name}"`, store: { _id: store._id, name: store.name } },
      { headers: { "Set-Cookie": await commitSession(session) } }
    );
  } catch (err: any) {
    return json({ error: "Erreur serveur", details: err.message || err }, { status: 500 });
  }
};

// --- Composants notifications & overlay ---
function ConnectionStatus({ error, onRetry, onDismiss }: { error?: string; onRetry: () => void; onDismiss: () => void }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    await new Promise(r => setTimeout(r, 1000));
    onRetry();
    setIsRetrying(false);
  };

  if (!isOnline) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <WifiOff className="text-red-600" />
          <span className="text-red-700 text-sm">Hors ligne</span>
        </div>
        <button onClick={onDismiss}><XCircle className="text-red-500" /></button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-yellow-600" />
            <span className="text-yellow-700 text-sm">{error}</span>
          </div>
          <button onClick={onDismiss}><XCircle className="text-yellow-500" /></button>
        </div>
        <button onClick={handleRetry} disabled={isRetrying} className="px-3 py-1 bg-yellow-500 text-white rounded-md">
          {isRetrying ? "Reconnexion..." : "Réessayer"}
        </button>
      </div>
    );
  }

  return null;
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
    </div>
  );
}

function SuccessNotification({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <CheckCircle className="text-green-600" />
        <span className="text-green-700 text-sm">{message}</span>
      </div>
      <button onClick={onDismiss}><XCircle className="text-green-500" /></button>
    </div>
  );
}

// --- Composant principal ---
export default function DashboardRoute() {
  const loaderData = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const fetcher = useFetcher();

  const [showError, setShowError] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const isLoading = navigation.state === "loading" || fetcher.state === "loading";

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (loaderData.currentStore && !loaderData.error && !loaderData.storeLoadError) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [loaderData.currentStore, loaderData.error, loaderData.storeLoadError]);

  const handleRetryStoreLoad = () => window.location.reload();
  const handleDismissError = () => setShowError(false);
  const handleDismissSuccess = () => setShowSuccess(false);

  return (
    <>
      {isLoading && <LoadingOverlay />}

      <DashboardLayout {...loaderData}>
        {/* Notifications */}
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-2xl px-4 space-y-2">
          {showSuccess && isOnline && !loaderData.error && (
            <SuccessNotification message="Connexion rétablie et données synchronisées" onDismiss={handleDismissSuccess} />
          )}
          {showError && (loaderData.error || !isOnline) && (
            <ConnectionStatus error={loaderData.error} onRetry={handleRetryStoreLoad} onDismiss={handleDismissError} />
          )}
        </div>

        {/* Contenu principal */}
        <div className={`transition-all duration-300 ${(showError && (loaderData.error || !isOnline)) || showSuccess ? 'pt-4' : ''}`}>
          <Outlet />
        </div>
      </DashboardLayout>
    </>
  );
}
