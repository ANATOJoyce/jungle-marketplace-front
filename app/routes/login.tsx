import { useState } from "react";
import type { ActionFunction } from "@remix-run/node";
import { useNavigate, Form, useActionData, redirect, json } from "@remix-run/react";
import { FiLogIn } from "react-icons/fi";

type ActionData = {
  error?: string;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const login = formData.get("login");
  const password = formData.get("password");

  if (
    typeof login !== "string" ||
    typeof password !== "string" ||
    !login ||
    !password
  ) {
    return json({ error: "Identifiant et mot de passe requis" }, { status: 400 });
  }

  // Appel API backend login
  const res = await fetch(`${process.env.PUBLIC_NEST_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    return json({ error: data.message || "Identifiants invalides" }, { status: 400 });
  }

  // TODO: gérer la session / cookie sécurisé ici (à ajouter selon ton besoin)

  return redirect("/dashboard");
};

export default function LoginPage() {
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const isPhoneFormatValid = (value: string) => {
    return /^\+\d{8,15}$/.test(value);
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setLogin(val);

    if (val.startsWith("+") && !isPhoneFormatValid(val)) {
      setPhoneError(
        "Format de téléphone invalide. Utilisez l’indicatif pays avec + et sans espaces (ex: +22870310380)."
      );
    } else {
      setPhoneError(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full p-6 shadow-[0_0_20px_#a3a29fff] rounded-2xl bg-white">
        <h2 className="text-xl font-bold mb-4 text-center">Connexion</h2>

        {actionData?.error && (
          <p className="text-red-600 mb-4 text-center">{actionData.error}</p>
        )}

        <Form method="post" className="space-y-4" noValidate>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Identifiant (email / téléphone)
            </label>
            <input
              type="text"
              name="login"
              value={login}
              onChange={handleLoginChange}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
            {login.startsWith("+") && (
              <p className="text-xs text-gray-500 mt-1">
                Entrez votre numéro avec indicatif pays, sans espaces, ex: +22870310380
              </p>
            )}
            {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
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
            disabled={!!phoneError}
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
