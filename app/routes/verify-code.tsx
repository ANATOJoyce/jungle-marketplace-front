// app/routes/verify-account.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useState } from "react";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const code = formData.get("code")?.toString();

  if (!email || !code) {
    return json({ error: "Email et code requis." }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.PUBLIC_NEST_API_URL}/auth/verify-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();

    if (!res.ok) {
      return json({ error: data.message || "Code invalide ou expiré." }, { status: res.status });
    }

    //  Code correct → redirection vers création boutique
    return redirect(`/login?email=${encodeURIComponent(email)}`);
  } catch (err) {
    return json({ error: "Erreur réseau ou serveur." }, { status: 500 });
  }
}

export default function VerifyAccountPage() {
  const actionData = useActionData<typeof action>();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <img src="Jungle_logo04.png" alt="" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifier votre code ici</h1>

      <div className="max-w-md w-full p-6 bg-white rounded-2xl shadow-lg">
        <h1 className="text-xl font-bold mb-4 text-center">Vérification de votre compte</h1>

        {actionData?.error && (
          <p className="text-red-600 mb-4 text-center">{actionData.error}</p>
        )}

        <Form method="post" className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="text"
            name="code"
            placeholder="Code reçu par mail"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <button
            type="submit"
            className="w-full py-3 mt-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md"
          >
            Vérifier le code
          </button>
        </Form>
      </div>
    </div>
  );
}
