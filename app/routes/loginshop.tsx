import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { getSession, commitSession } from "~/utils/session.server";
import { FiLogIn } from "react-icons/fi";



export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const access_token = session.get("token");

  // Si un access_token existe, redirection vers le tableau de bord (par rôle)
  if (access_token) {
    // Si tu stockes le rôle dans la session, tu peux vérifier ici :
    const userRole = session.get("role");
    if (userRole === "VENDOR") {
      return redirect("/register-shop");
    }
    return redirect("/register-shop");
  }
  return json({});
};


export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("login");
  const password = formData.get("password");

  // Vérifier la validité des champs
  if (typeof username !== "string" || typeof password !== "string") {
    return json({ error: "Champs invalides." }, { status: 400 });
  }

  try {
    // Effectuer la requête d'authentification
    const res = await fetch(`${process.env.NEST_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    // Si la réponse de l'API est incorrecte, renvoyer un message d'erreur
    if (!res.ok) {
      return json({ error: data.message || "Identifiants invalides." }, { status: 401 });
    }

    // Récupérer la session
    const session = await getSession(request.headers.get("Cookie"));

    // Sauvegarder le token dans la session
    session.set("token", data.access_token);

    // Déterminer la redirection en fonction du rôle de l'utilisateur
    const userRole = data.user?.role || data.role;
    let redirectTo = "/register-shop";

    if (userRole === "admin") {
      redirectTo = "/admin/dashboard";
    }

    // Retourner la redirection avec le cookie de session mis à jour
    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (err) {
    // Gestion des erreurs
    return json({ error: "Erreur de connexion au serveur." }, { status: 500 });
  }
};

//  Composant de la page

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const error = actionData?.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full p-6 shadow-[0_0_20px_#a3a29fff] rounded-2xl bg-white">
        <h2 className="text-xl font-bold mb-4 text-center">Connexion</h2>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        <Form method="post" className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Identifiant (email / téléphone)
            </label>
            <input
              type="text"
              name="login"
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Mot de passe</label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-6 bg-orange-600 hover:bg-orange-700 text-white"
          >
            Se connecter
          </button>

          <div className="text-center mt-6 text-gray-600">
            Vous n’avez pas encore de compte ?{" "}
            <a
              href="/register"
              className="text-orange-600 font-medium hover:underline flex items-center justify-center"
            >
              <FiLogIn className="mr-1" /> Créer un compte
            </a>
          </div>
        </Form>
      </div>
    </div>
  );
}
