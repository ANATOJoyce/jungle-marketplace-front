import {
  json,
  redirect,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/node";
import {
  useLoaderData,
  Form,
  useActionData,
  useNavigation,
  Link,
} from "@remix-run/react";
import { getSession } from "~/utils/session.server";
import { useEffect, useState } from "react";


type ActionData = {
  error?: string;
  success?: boolean;
};

type LoaderData = {
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
};



export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  console.log(token)
  if (!token) return redirect("/login");

  console.log("API URL:", process.env.NEST_API_URL);

  const res = await fetch(`${process.env.NEST_API_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Response("Erreur lors de la récupération du profil", {
      status: res.status,
    });
  }

  const user = await res.json();

  return json<LoaderData>({ user });
};



type JwtPayload = {
  sub: string;
  email: string;
  // ajoute d'autres champs si besoin
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/login");


  const formData = await request.formData();
  const updatedData = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  };

  console.log("API URL:", process.env.NEST_API_URL);

  const res = await fetch(`${process.env.NEST_API_URL}/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Erreur API:", err);
    return json({ error: "Échec de la mise à jour" }, { status: 400 });
  }

  return json({ success: true });
};


export default function SettingsPage() {
  const { user } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [formData, setFormData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone || "",
  });

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (actionData?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-semibold text-orange-600">Mon profil</h2>

      {actionData?.error && (
        <p className="text-red-500 font-medium">{actionData.error}</p>
      )}
      {showSuccess && (
        <p className="text-green-600 font-medium">Modifications enregistrées</p>
      )}

      <Form
        method="post"
        className="bg-white border border-yellow-300 p-6 rounded-xl shadow space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Prénom</label>
            <input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full border border-yellow-400 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nom</label>
            <input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full border border-yellow-400 rounded px-3 py-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-yellow-400 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone</label>
          <input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-yellow-400 rounded px-3 py-2"
          />
        </div>

        <div className="pt-4">
                     <td className="px-4 py-3">
                      <Link
                        to={`/dashboard/stores/${user.first_name}/edit`}
                        className="inline-block px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                      >
                        Modifier
                      </Link>
                    </td>
        </div>
      </Form>
    </div>
  );
}
