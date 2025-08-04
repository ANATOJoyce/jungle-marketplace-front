import { useState } from "react";
import { useNavigate, Form, useActionData, redirect, json } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { FiLogIn } from "react-icons/fi";

type ActionData = {
  error?: string;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const first_name = formData.get("first_name");
  const last_name = formData.get("last_name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string" ||
    !email ||
    !password ||
    !confirmPassword
  ) {
    return json(
      { error: "Tous les champs obligatoires doivent être remplis." },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return json(
      { error: "Les mots de passe ne correspondent pas." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${process.env.PUBLIC_NEST_API_URL}/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          phone,
          password,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return json({ error: data.message || "Erreur d'inscription" }, { status: 400 });
    }

    return redirect("/register-shop");
  } catch (err) {
    return json({ error: "Erreur réseau ou serveur." }, { status: 500 });
  }
};

export default function RegisterVendor() {
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");

  const isPhoneFormatValid = (value: string) => /^\+\d{8,15}$/.test(value);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setPhone(val);
    if (val.startsWith("+") && !isPhoneFormatValid(val)) {
      setPhoneError("Format de téléphone invalide. Utilisez l’indicatif pays avec + et sans espaces.");
    } else {
      setPhoneError(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full p-6 shadow-[0_0_20px_#a3a29fff] rounded-2xl bg-white">
        <h2 className="text-xl font-bold mb-4 text-center">Créer un compte vendeur</h2>

        {actionData?.error && (
          <p className="text-red-600 mb-4 text-center">{actionData.error}</p>
        )}

        <Form method="post" className="space-y-4" noValidate>
          <div>
            <label className="block mb-1 text-sm font-medium">Prénom</label>
            <input type="text" name="first_name" required className="w-full px-4 py-2 border rounded-md" />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Nom</label>
            <input type="text" name="last_name" required className="w-full px-4 py-2 border rounded-md" />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input type="email" name="email" required className="w-full px-4 py-2 border rounded-md" />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Téléphone</label>
            <input
              type="tel"
              name="phone"
              value={phone}
              onChange={handlePhoneChange}
              className="w-full px-4 py-2 border rounded-md"
            />
            {phone.startsWith("+") && (
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
              required
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Confirmer le mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              required
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={!!phoneError}
            className="w-full py-3 mt-6 bg-orange-600 hover:bg-orange-700 text-white"
          >
            Créer le compte
          </button>

          <div className="text-center mt-6 text-gray-600">
            Vous avez déjà un compte ?{" "}
            <a
              href="/login"
              className="text-orange-600 font-medium hover:underline flex items-center justify-center"
            >
              <FiLogIn className="mr-1" /> Se connecter
            </a>
          </div>
        </Form>
      </div>
    </div>
  );
}
