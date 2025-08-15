import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useState } from "react";
import { FiLogIn } from "react-icons/fi";
import { getSession, commitSession } from "~/utils/session.server";




export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const first_name = formData.get("first_name")?.toString();
  const last_name = formData.get("last_name")?.toString();
  const email = formData.get("email")?.toString();
  const phone = formData.get("phone")?.toString();
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  if (!email || !password || !confirmPassword) {
    return json({ error: "Tous les champs obligatoires doivent être remplis." }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return json({ error: "Les mots de passe ne correspondent pas." }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.PUBLIC_NEST_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name, last_name, email, phone, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return json({ error: data.message || "Erreur d'inscription" }, { status: res.status });
    }

    if (data.access_token) {
      const session = await getSession(request.headers.get("Cookie"));
      session.set("access_token", data.access_token);
      session.set("user", data.user);

      console.log(data)

      return redirect("/register-shop", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    return json({ error: "Token manquant après inscription." }, { status: 500 });
  } catch (err) {
    return json({ error: "Erreur réseau ou serveur." }, { status: 500 });
  }
}

export default function RegisterVendor() {
  const actionData = useActionData<typeof action>();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "phone") {
      if (value.startsWith("+") && !/^\+\d{8,15}$/.test(value)) {
        setPhoneError("Format de téléphone invalide. Ex: +22870310380");
      } else {
        setPhoneError(null);
      }
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
          {[
            { label: "Prénom", name: "first_name" },
            { label: "Nom", name: "last_name" },
            { label: "Email", name: "email", type: "email" },
          ].map(({ label, name, type = "text" }) => (
            <div key={name}>
              <label className="block mb-1 text-sm font-medium">{label}</label>
              <input
                type={type}
                name={name}
                value={(formData as any)[name]}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
          ))}

          <div>
            <label className="block mb-1 text-sm font-medium">Téléphone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
            {formData.phone.startsWith("+") && (
              <p className="text-xs text-gray-500 mt-1">
                Ex: +22870310380
              </p>
            )}
            {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Confirmer le mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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