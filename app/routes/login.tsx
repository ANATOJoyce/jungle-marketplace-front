import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { getSession, commitSession } from "~/utils/session.server";
import { FiLogIn, FiEye, FiEyeOff, FiUser, FiLock, FiUserPlus } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";

// --- Validation utilities ---
const validateLogin = (login: string): { isValid: boolean; error?: string } => {
  if (!login.trim()) return { isValid: false, error: "L'identifiant est requis" };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(\+?\d{8,15})$/;
  if (emailRegex.test(login) || phoneRegex.test(login.replace(/\s+/g, ''))) return { isValid: true };
  return { isValid: false, error: "Format invalide. Utilisez un email ou un numéro de téléphone" };
};

// --- Loader ---
export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const access_token = session.get("token");

  if (access_token) {
    const userRole = session.get("role");
    if (userRole === "ADMIN") return redirect("/admin/dashboard");
    if (userRole === "MANAGER") return redirect("/manager");
    if (userRole === "CLIENT") return redirect("/dashboard");
  }

  return json({});
};

// --- Action ---
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("login")?.toString()?.trim();
  const password = formData.get("password")?.toString();
  const rememberMe = formData.get("rememberMe") === "on";

  const errors: Record<string, string> = {};
  if (!username) errors.login = "L'identifiant est requis";
  if (!password) errors.password = "Le mot de passe est requis";
  if (Object.keys(errors).length > 0) return json({ errors }, { status: 400 });

  try {
    const res = await fetch(`${process.env.NEST_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    console.log("Réponse login:", data);

    if (!res.ok) {
      return json(
        { errors: { general: data.message || "Erreur d'authentification" } },
        { status: res.status }
      );
    }

    // Decode token pour trouver le rôle
    interface JwtPayload {
      sub: string;
      email: string;
      role?: string;
      roles?: string[];
    }

    const decoded: JwtPayload = jwtDecode(data.access_token);
    const userRole =
      data.user?.role ||
      data.role ||
      decoded.role ||
      decoded.roles?.[0] ||
      "CLIENT";

    console.log("Rôle détecté:", userRole);

    const session = await getSession(request.headers.get("Cookie"));
    session.set("token", data.access_token);
    session.set("user", data.user);
    session.set("role", userRole);

    // Redirection dynamique selon rôle
    let redirectTo = "/dashboard";
    if (userRole === "ADMIN") redirectTo = "/admin/dashboard";
    else if (userRole === "MANAGER") redirectTo = "/manager";
    else if (userRole === "VENDOR") redirectTo = "/dashboard";

    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await commitSession(session, rememberMe ? { maxAge: 2592000 } : undefined),
      },
    });
  } catch (err) {
    console.error("Erreur login:", err);
    return json({ errors: { general: "Erreur serveur." } }, { status: 500 });
  }
};

// --- Composant React ---
export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [formData, setFormData] = useState({ login: "", password: "", rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const errors = actionData?.errors || {};
  const allErrors = { ...errors, ...clientErrors };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (clientErrors[name]) {
      const updated = { ...clientErrors };
      delete updated[name];
      setClientErrors(updated);
    }

    if (name === "login" && typeof newValue === "string" && newValue.trim()) {
      const loginValidation = validateLogin(newValue);
      if (!loginValidation.isValid)
        setClientErrors((prev) => ({ ...prev, login: loginValidation.error! }));
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      
      {/* Section gauche - Formulaire */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 md:px-16 lg:px-24 py-12">
        <div className="max-w-md mx-auto w-full bg-white border border-gray-200 shadow-md rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#fbb344] rounded-full mx-auto mb-4 flex items-center justify-center">
              <FiUser className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Bon retour !</h1>
            <p className="text-gray-600">Connectez-vous à votre compte</p>
          </div>

          {allErrors.general && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg">
              <p className="text-sm font-medium">{allErrors.general}</p>
            </div>
          )}

          <Form method="post" className="space-y-6" noValidate>
            {/* Identifiant */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Identifiant<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="text"
                  name="login"
                  value={formData.login}
                  onChange={handleChange}
                  placeholder="Email ou téléphone"
                  required
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                    allErrors.login
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 bg-gray-50 focus:border-[#fbb344]"
                  } focus:ring-4 focus:ring-[#fbb344]/30 outline-none`}
                />
              </div>
              {allErrors.login && <p className="text-red-500 text-sm mt-2">{allErrors.login}</p>}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Votre mot de passe"
                  required
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl transition-all duration-200 ${
                    allErrors.password
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 bg-gray-50 focus:border-[#fbb344]"
                  } focus:ring-4 focus:ring-[#fbb344]/30 outline-none`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {allErrors.password && <p className="text-red-500 text-sm mt-2">{allErrors.password}</p>}
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#fbb344] border-gray-300 rounded"
                />
                <span>Se souvenir de moi</span>
              </label>
              <a href="/forgot-password" className="text-sm text-[#fbb344] font-medium hover:underline">
                Mot de passe oublié ?
              </a>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#fbb344] hover:bg-[#e5a32f] text-white font-semibold rounded-xl transition-all duration-200 shadow-md"
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 mb-3">Pas encore de compte ?</p>
              <a
                href="/register"
                className="inline-flex items-center justify-center px-6 py-3 border border-[#fbb344] rounded-xl text-[#fbb344] font-medium hover:bg-[#fff7e8] transition-all"
              >
                <FiUserPlus className="mr-2" /> Créer un compte
              </a>
            </div>
          </Form>
        </div>
      </div>

      {/* Section droite - Image */}
      <div className="hidden lg:block w-1/2">
        <img
          src="/loginImage.jpeg"
          alt="Connexion"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
