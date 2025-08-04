import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import type { ActionFunctionArgs } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  
  // Convertir FormData en objet simple en excluant les fichiers
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      values[key] = value;
    }
  }

  try {
    const response = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        error: errorData.message || "Échec de l'inscription", 
        fields: values,
        fieldErrors: errorData.errors || {}
      };
    }

    return { success: true };
  } catch (error) {
    return { 
      error: "Erreur de connexion au serveur",
      fields: values
    };
  }
};

export default function RegisterForm() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const validateForm = (formData: FormData) => {
    const newErrors: Record<string, string> = {};
    const { first_name, last_name, phone, email, password } = Object.fromEntries(formData);

    if (!first_name) newErrors.first_name = "Le prénom est requis";
    if (!last_name) newErrors.last_name = "Le nom est requis";
    
    if (!phone) {
      newErrors.phone = "Le téléphone est requis";
    } else if (!/^\+?[\d\s-]{10,}$/.test(phone.toString())) {
      newErrors.phone = "Numéro de téléphone invalide";
    }

    if (!email) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toString())) {
      newErrors.email = "Email invalide";
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.toString().length < 6) {
      newErrors.password = "Minimum 6 caractères";
    }

    setClientErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getFieldError = (fieldName: string) => {
    return clientErrors[fieldName] || actionData?.fieldErrors?.[fieldName];
  };

  const getFieldDefaultValue = (fieldName: string) => {
    return actionData?.fields?.[fieldName] || "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Créer un compte
          </h2>
        </div>

        {/* Messages d'état */}
        {actionData?.error && !actionData?.success && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {actionData.error}
          </div>
        )}

        {actionData?.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            Inscription réussie! Vous pouvez maintenant vous connecter.
          </div>
        )}

        <Form
          className="mt-8 space-y-6"
          method="post"
          onSubmit={(e) => {
            const formData = new FormData(e.currentTarget);
            if (!validateForm(formData)) {
              e.preventDefault();
            }
          }}
        >
          <div className="space-y-4">
            {/* Prénom */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                autoComplete="given-name"
                required
                defaultValue={getFieldDefaultValue("first_name")}
                className={`mt-1 block w-full px-3 py-2 border ${
                  getFieldError("first_name") ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {getFieldError("first_name") && (
                <p className="mt-1 text-sm text-red-600">{getFieldError("first_name")}</p>
              )}
            </div>

            {/* Nom */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                autoComplete="family-name"
                required
                defaultValue={getFieldDefaultValue("last_name")}
                className={`mt-1 block w-full px-3 py-2 border ${
                  getFieldError("last_name") ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {getFieldError("last_name") && (
                <p className="mt-1 text-sm text-red-600">{getFieldError("last_name")}</p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                defaultValue={getFieldDefaultValue("phone")}
                className={`mt-1 block w-full px-3 py-2 border ${
                  getFieldError("phone") ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {getFieldError("phone") && (
                <p className="mt-1 text-sm text-red-600">{getFieldError("phone")}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue={getFieldDefaultValue("email")}
                className={`mt-1 block w-full px-3 py-2 border ${
                  getFieldError("email") ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {getFieldError("email") && (
                <p className="mt-1 text-sm text-red-600">{getFieldError("email")}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className={`mt-1 block w-full px-3 py-2 border ${
                  getFieldError("password") ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {getFieldError("password") && (
                <p className="mt-1 text-sm text-red-600">{getFieldError("password")}</p>
              )}
            </div>
          </div>

          {/* Bouton de soumission */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
            </button>
          </div>
        </Form>

        {/* Lien vers login */}
        <div className="text-center">
          <p className="mt-2 text-sm text-gray-600">
            Déjà un compte?{" "}
            <a
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}