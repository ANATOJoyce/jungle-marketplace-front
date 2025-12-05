// src/routes/register-vendor.tsx
import type { ActionFunctionArgs } from "@remix-run/node"; 
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { FiLogIn, FiEye, FiEyeOff, FiX, FiCheck } from "react-icons/fi";

// --- Types ---
type Country = {
  _id: string;
  name: string;
  iso2: string;      // ISO2 obligatoire pour les drapeaux
  phoneCode: string; // indicatif international
};

// --- Loader pour récupérer les pays depuis la DB ---
export const loader = async () => {
  const res = await fetch(`${process.env.PUBLIC_NEST_API_URL}/regions/countries`);
  const countries: Country[] = res.ok ? await res.json() : [];
  return json({ countries });
};

// --- Action serveur ---
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const first_name = formData.get("first_name")?.toString().trim();
  const last_name = formData.get("last_name")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const phoneLocal = formData.get("phoneLocal")?.toString().trim();
  const phoneCode = formData.get("phoneCode")?.toString().trim();
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  if (!first_name || !last_name || !email || !password || !confirmPassword) {
    return json({ error: "Tous les champs obligatoires doivent être remplis." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Adresse email invalide." }, { status: 400 });
  }

  const fullPhone = phoneCode && phoneLocal ? phoneCode + phoneLocal : undefined;
  if (fullPhone && !/^\+\d{8,15}$/.test(fullPhone)) {
    return json({ error: "Format de téléphone invalide." }, { status: 400 });
  }

  if (password.length < 8) {
    return json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return json({ error: "Les mots de passe ne correspondent pas." }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.PUBLIC_NEST_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name, last_name, email, phone: fullPhone, password }),
    });

    const data = await res.json();
    if (!res.ok) return json({ error: data.message || "Erreur d'inscription" }, { status: res.status });

    return redirect(`/verify-code?email=${encodeURIComponent(email)}`);
  } catch {
    return json({ error: "Erreur réseau ou serveur. Veuillez réessayer." }, { status: 500 });
  }
}

// --- Dropdown pays avec drapeaux ---
function CountryDropdown({
  countries,
  selectedCountry,
  setSelectedCountry,
}: {
  countries: Country[];
  selectedCountry?: Country;
  setSelectedCountry: (c: Country) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border rounded-lg p-2 flex items-center justify-between"
      >
        {selectedCountry ? (
          <div className="flex items-center gap-2">
            <img
              src={`https://flagcdn.com/32x24/${selectedCountry.iso2.toLowerCase()}.png`}
              alt={selectedCountry.name}
              className="w-5 h-5"
            />
            <span>{selectedCountry.name}</span>
          </div>
        ) : (
          <span>Sélectionner un pays</span>
        )}
        <span>▼</span>
      </button>

      {isOpen && (
        <ul className="absolute z-10 w-full bg-white border rounded-lg max-h-60 overflow-auto mt-1">
          {countries.map((c) => (
            <li
              key={c._id}
              onClick={() => { setSelectedCountry(c); setIsOpen(false); }}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
            >
              <img
                src={`https://flagcdn.com/32x24/${c.iso2.toLowerCase()}.png`}
                alt={c.name}
                className="w-5 h-5"
              />
              <span>{c.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --- Composant Principal ---
export default function RegisterVendor() {
  const { countries } = useLoaderData<{ countries: Country[] }>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(countries[0]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phoneLocal: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "phoneLocal") {
      if (value && !/^\d{4,14}$/.test(value)) setPhoneError("Numéro local invalide");
      else setPhoneError(null);
    }
  };

  const isFormValid =
    formData.first_name &&
    formData.last_name &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.password &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword &&
    !phoneError &&
    selectedCountry;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-center max-w-5xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">

        {/* Formulaire */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Créer un compte vendeur</h2>

          {actionData?.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <FiX className="text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{actionData.error}</p>
            </div>
          )}

          <Form method="post" className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="first_name"
                placeholder="Prénom"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-lg"
              />
              <input
                type="text"
                name="last_name"
                placeholder="Nom"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-lg"
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-lg"
            />

            {/* Dropdown pays */}
            <CountryDropdown
              countries={countries}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
            />
            <input type="hidden" name="phoneCode" value={selectedCountry?.phoneCode ?? ""} />

            {/* Téléphone local */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-lg">
                {selectedCountry?.phoneCode ?? "+000"}
              </span>
              <input
                type="tel"
                name="phoneLocal"
                placeholder="70123456"
                value={formData.phoneLocal}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-r-lg ${phoneError ? "border-red-300" : "border-gray-300"}`}
              />
            </div>
            {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}

            {/* Mot de passe */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-lg pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            {/* Confirmation mot de passe */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-lg pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-3 mt-6 rounded-lg font-medium transition-all duration-200 ${
                isFormValid && !isSubmitting
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Création en cours..." : "Créer le compte"}
            </button>
          </Form>
        </div>

        {/* Image droite */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-orange-100 to-orange-50">
          <img src="/register.png" alt="Illustration inscription" className="w-full h-full object-cover" />
        </div>
      </div>
      
    </div>
  );
}
