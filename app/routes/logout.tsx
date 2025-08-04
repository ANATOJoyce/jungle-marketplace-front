import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { LogoJungle } from "~/components/auth/LogoJungle";
import { destroySession, getSession } from "~/utils/session.server";
import { useEffect, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return json(
    { success: true },
    {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export default function LogoutPage() {
  const { success } = useLoaderData<typeof loader>();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (success) {
      // Suppression immédiate des tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }, [success]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Attendre la redirection après la déconnexion
    setTimeout(() => {
      window.location.href = "/login"; // Redirection explicite après déconnexion
    }, 1000); // Délai pour afficher l'animation ou un message de succès
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
          <LogoJungle size="lg" className="mx-auto mb-8" />

          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Déconnexion réussie
            </h1>

            <p className="text-gray-600 mb-6">
              Vous avez été déconnecté avec succès. Vous allez bientôt être redirigé.
            </p>

            <Link
              to="/login"
              className="block w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg text-center mb-4"
            >
              Se reconnecter
            </Link>

            <Link
              to="/"
              className="block w-full border border-orange-600 text-orange-600 hover:bg-orange-50 py-2 px-4 rounded-lg text-center"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Form method="POST" className="w-full max-w-md text-center">
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <LogoJungle size="lg" className="mx-auto mb-8" />

          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Confirmer la déconnexion
          </h1>

          <button
            type="button"
            onClick={handleLogout} // Ajout de la gestion de la déconnexion ici
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg mb-4"
          >
            {isLoggingOut ? "Déconnexion en cours..." : "Se déconnecter"}
          </button>

          <Link
            to="/"
            className="block w-full border border-orange-600 text-orange-600 hover:bg-orange-50 py-2 px-4 rounded-lg text-center"
          >
            Annuler
          </Link>
        </div>
      </Form>
    </div>
  );
}
