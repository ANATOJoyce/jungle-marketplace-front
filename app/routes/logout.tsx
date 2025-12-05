import { json, redirect } from "@remix-run/node";
import { getSession, destroySession } from "~/utils/session.server";
import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";
import { Check, LogOut } from "lucide-react";
import { LogoJungle } from "~/components/auth/LogoJungle";

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  return json(
    { success: true },
    { headers: { "Set-Cookie": await destroySession(session) } }
  );
}

export async function action({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}

export default function LogoutPage() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/login";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-lg max-w-md w-full overflow-hidden">
        {/* En-tête */}
        <div className="p-8 text-center border-b border-gray-100">
          <div className="w-16 h-16 bg-[#fbb344]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-[#fbb344]" size={36} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Déconnexion réussie
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Vous serez redirigé dans {countdown}s...
          </p>
        </div>

        {/* Corps */}
        <div className="p-8 text-center space-y-5">
          <LogoJungle className="mx-auto" size="md" />

          <p className="text-gray-600 text-sm">
            Votre session a été fermée avec succès.  
            À bientôt sur notre plateforme !
          </p>

          {/* Barre de progression */}
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-[#fbb344] h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((5 - countdown) / 5) * 100}%` }}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-4">
            <Link
              to="/login"
              className="bg-[#fbb344] text-white font-semibold py-3 rounded-lg hover:bg-[#e5a32f] transition"
            >
              Se reconnecter
            </Link>

            <Link
              to="/"
              className="border border-[#fbb344] text-[#fbb344] font-semibold py-3 rounded-lg hover:bg-[#fbb344]/10 transition"
            >
              Retour à l’accueil
            </Link>
          </div>
        </div>

        {/* Pied */}
        <p className="text-xs text-center text-gray-400 pb-4">
          Vos données ont été supprimées en toute sécurité.
        </p>
      </div>
    </div>
  );
}
