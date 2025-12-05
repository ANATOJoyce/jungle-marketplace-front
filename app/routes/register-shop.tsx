import { json, redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { getSession } from "~/utils/session.server";
import { Button } from "~/components/ui/Button";
import { useState, useEffect, useRef } from "react";
import { FiCheck, FiChevronDown, FiSearch, FiX, FiShoppingBag, FiGlobe, FiDollarSign } from "react-icons/fi";

type Country = {
  _id: string;
  name: string;
  iso2: string;
  currency_code: string;
};

type LoaderData = {
  user: { sub: string; email: string };
  countries: Country[];
};

type ActionData = {
  error?: string;
  fieldErrors?: {
    name?: string;
    countryId?: string;
  };
};

// ----------------- Loader -----------------
export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/loginshop");

  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());

    const res = await fetch(`${process.env.PUBLIC_NEST_API_URL || "http://localhost:3000"}/regions/countries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const countries: Country[] = res.ok ? await res.json() : [];

    return json<LoaderData>({ user: payload, countries });
  } catch (error) {
    console.error("Loader error:", error);
    return redirect("/loginshop");
  }
};

// ----------------- Action -----------------
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = (formData.get("name") as string)?.trim();
  const countryId = formData.get("countryId") as string;

  const fieldErrors: ActionData["fieldErrors"] = {};

  // Validation côté serveur
  if (!name) {
    fieldErrors.name = "Le nom de la boutique est requis.";
  } else if (name.length < 3) {
    fieldErrors.name = "Le nom doit contenir au moins 3 caractères.";
  } else if (name.length > 100) {
    fieldErrors.name = "Le nom ne peut pas dépasser 100 caractères.";
  }

  if (!countryId) {
    fieldErrors.countryId = "Veuillez sélectionner un pays.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return json({ fieldErrors }, { status: 400 });
  }

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/loginshop");

  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());

    const res = await fetch(`${process.env.PUBLIC_NEST_API_URL || "http://localhost:3000"}/store/create-shop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        country: countryId,
        owner: payload.sub,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      return json({ error: data.message || "Erreur lors de la création de la boutique." }, { status: res.status });
    }

    return redirect("/chargementPage?success=Boutique créée avec succès");
  } catch (error) {
    console.error("Action error:", error);
    return json({ error: "Erreur réseau ou serveur. Veuillez réessayer." }, { status: 500 });
  }
};

// ----------------- Dropdown Custom Amélioré -----------------
function CountryDropdown({
  countries,
  selectedCountry,
  setSelectedCountry,
  error,
}: {
  countries: Country[];
  selectedCountry: Country | null;
  setSelectedCountry: (c: Country) => void;
  error?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border rounded-lg p-3 flex items-center justify-between transition-all ${
          error 
            ? "border-red-300 focus:ring-2 focus:ring-red-500" 
            : "border-gray-300 focus:ring-2 focus:ring-orange-500 hover:border-gray-400"
        } ${isOpen ? "ring-2 ring-orange-500 border-transparent" : ""}`}
      >
        {selectedCountry ? (
          <div className="flex items-center gap-3">
            <img
              src={`https://flagcdn.com/32x24/${selectedCountry.iso2.toLowerCase()}.png`}
              alt={selectedCountry.name}
              className="w-6 h-5 rounded shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="font-medium text-gray-700">{selectedCountry.name}</span>
          </div>
        ) : (
          <span className="text-gray-500">Sélectionner un pays</span>
        )}
        <FiChevronDown 
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} 
          size={20} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-2 overflow-hidden">
          {/* Barre de recherche */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un pays..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Liste des pays */}
          <ul className="max-h-60 overflow-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => (
                <li
                  key={c._id}
                  onClick={() => handleSelect(c)}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-orange-50 cursor-pointer transition-colors ${
                    selectedCountry?._id === c._id ? "bg-orange-100" : ""
                  }`}
                >
                  <img
                    src={`https://flagcdn.com/32x24/${c.iso2.toLowerCase()}.png`}
                    alt={c.name}
                    className="w-6 h-5 rounded shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="flex-1 font-medium text-gray-700">{c.name}</span>
                  {selectedCountry?._id === c._id && (
                    <FiCheck className="text-orange-600" size={18} />
                  )}
                </li>
              ))
            ) : (
              <li className="px-4 py-8 text-center text-gray-500">
                <FiSearch className="mx-auto mb-2 text-gray-300" size={32} />
                <p>Aucun pays trouvé</p>
              </li>
            )}
          </ul>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs mt-1.5 flex items-center">
          <FiX className="mr-1" size={14} /> {error}
        </p>
      )}
    </div>
  );
}

// ----------------- Composant Principal -----------------
export default function RegisterShop() {
  const { countries } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [shopName, setShopName] = useState("");
  const [touched, setTouched] = useState({ name: false });

  useEffect(() => {
    if (countries.length > 0 && !selectedCountry) {
      setSelectedCountry(countries[0]);
    }
  }, [countries, selectedCountry]);

  const handleBlur = () => {
    setTouched({ ...touched, name: true });
  };

  // Validation en temps réel
  const nameError = touched.name && !shopName 
    ? "Le nom est requis" 
    : touched.name && shopName.length < 3 
    ? "Minimum 3 caractères" 
    : null;

  const isFormValid = shopName.trim().length >= 3 && selectedCountry;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50 px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg">
            <FiShoppingBag className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Créez votre boutique</h1>
          <p className="text-gray-600">Commencez à vendre vos produits en quelques clics</p>
        </div>

        {/* Card principale */}
        <div className="bg-white p-8 shadow-2xl rounded-2xl border border-gray-100">
          {/* Message d'erreur global */}
          {actionData?.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <FiX className="text-red-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
              <p className="text-red-700">{actionData.error}</p>
            </div>
          )}

          <Form method="post" className="space-y-6">
            {/* Nom de la boutique */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <FiShoppingBag className="mr-2 text-orange-600" size={18} />
                Nom de la boutique
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                onBlur={handleBlur}
                required
                maxLength={100}
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                  nameError || actionData?.fieldErrors?.name
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                placeholder="Ex: Ma Super Boutique"
              />
              <div className="flex justify-between items-center mt-1.5">
                <div>
                  {(nameError || actionData?.fieldErrors?.name) && (
                    <p className="text-red-500 text-xs flex items-center">
                      <FiX className="mr-1" size={14} />
                      {nameError || actionData?.fieldErrors?.name}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {shopName.length}/100
                </span>
              </div>
            </div>

            {/* Pays */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <FiGlobe className="mr-2 text-orange-600" size={18} />
                Pays d'opération
                <span className="text-red-500 ml-1">*</span>
              </label>
              <CountryDropdown
                countries={countries}
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
                error={actionData?.fieldErrors?.countryId}
              />
              <input
                type="hidden"
                name="countryId"
                value={selectedCountry?._id || ""}
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Sélectionnez le pays principal où vous vendrez vos produits
              </p>
            </div>

            {/* Devise (auto) */}
            {selectedCountry && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <FiDollarSign className="mr-2 text-orange-600" size={18} />
                  Devise de la boutique
                </label>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                    <span className="text-orange-600 font-bold text-lg">
                      {selectedCountry.currency_code.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{selectedCountry.currency_code}</p>
                    <p className="text-xs text-gray-500">Définie automatiquement selon le pays</p>
                  </div>
                </div>
              </div>
            )}

            {/* Informations supplémentaires */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                <FiCheck className="mr-2" size={18} />
                Ce qui est inclus
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Gestion complète de vos produits et inventaire</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Tableau de bord avec statistiques en temps réel</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Support client dédié pour vous accompagner</span>
                </li>
              </ul>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-4 rounded-lg font-semibold transition-all duration-200 text-lg ${
                isFormValid && !isSubmitting
                  ? "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Création en cours...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FiShoppingBag className="mr-2" size={20} />
                  Créer ma boutique
                </span>
              )}
            </button>
          </Form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              En créant votre boutique, vous acceptez nos conditions d'utilisation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}