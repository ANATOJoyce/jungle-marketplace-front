import {  useState } from "react";
import { Form, json, redirect, useActionData, useNavigation } from "@remix-run/react";
import { Plus, Minus, Package, Palette, Ruler, DollarSign, Hash, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import UploadWidget from "~/components/uploadWidget";
import { getSession } from "~/utils/session.server";
import { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";


// Types pour une meilleure sécurité
interface JwtPayload {
  sub: string;
  email: string;
  first_name?: string;
  last_name?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

interface Store {
  _id: string;
  id: string;
  name: string;
  status: string;
  default_sales_channel_id?: string;
  default_region_id?: string;
  default_location_id?: string;
  createdAt: string;
  updatedAt: string;
}

interface LoaderData {
  token: string;
  user: JwtPayload;
  isAuthenticated: boolean;
  currentStore: Store | null;
  error?: string;
  storeLoadError?: boolean;
}



// Fonction utilitaire pour décoder le JWT
function decodeJWT(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );

    // Vérifier l'expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      throw new Error("Token expired");
    }

    return payload;
  } catch (error) {
    console.error("Erreur lors du décodage du JWT:", error);
    return null;
  }
}

// Fonction utilitaire pour charger la boutique active
async function loadCurrentStore(storeId: string,token: string): Promise<{ store: Store | null; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout de 10s

    const res = await fetch(
      `${process.env.NEST_API_URL}/store/${storeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 404) {
        return { store: null, error: "Boutique non trouvée" };
      }
      if (res.status === 403) {
        return { store: null, error: "Accès non autorisé à cette boutique" };
      }
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const storeData = await res.json();

    // Normalisation des données de la boutique
    const normalizedStore: Store = {
      _id: storeData._id || storeData.id,
      id: storeData.id || storeData._id,
      name: storeData.name || "Boutique sans nom",
      status: storeData.status || "unknown",
      default_region_id: storeData.default_region_id,
      createdAt: storeData.createdAt || new Date().toISOString(),
      updatedAt: storeData.updatedAt || new Date().toISOString(),
    };

    return { store: normalizedStore };
  } catch (error) {
    console.error("Erreur lors du chargement de la boutique:", error);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { store: null, error: "Timeout lors du chargement de la boutique" };
      }
      return { store: null, error: error.message };
    }

    return { store: null, error: "Erreur inconnue lors du chargement de la boutique" };
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("token");
    const currentStoreId = session.get("currentStoreId");

    if (!token) {
      return redirect("/login");
    }

    const payload = decodeJWT(token);
    if (!payload) {
      console.warn("Token invalide ou expiré.");
      return redirect("/login");
    }

    if (!currentStoreId) {
      return json({
        error: "Aucune boutique active sélectionnée.",
      }, { status: 400 });
    }

    const { store, error } = await loadCurrentStore(currentStoreId, token);

    if (error || !store) {
      console.warn("Erreur lors du chargement de la boutique :", error);
      return json({
        error: error || "Impossible de charger la boutique.",
      }, { status: 400 });
    }

    return json({
      token,
      user: payload,
      currentStore: store,
      error: null,
    });
  } catch (error) {
    console.error("Erreur critique dans le loader produit:", error);
    return redirect("/login?error=critical");
  }
}


export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const title = formData.get("title");
  const description = formData.get("description");
  const imageUrl = formData.get("imageUrl");
  const priceStr = formData.get('price');
  const price = priceStr ? Number(priceStr) : NaN;
  const totalStockStr = formData.get('totalStock')
  const totalStock = totalStockStr ? Number(totalStockStr) : NaN;

if (
  typeof title !== "string" ||
  typeof description !== "string" ||
  typeof imageUrl !== "string" ||
  isNaN(price)
) {
  return json({ error: "Champs invalides." }, { status: 400 });
}

 

  // Authentification + récupération du store actif
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const storeId = session.get("currentStoreId");

  if (!token) {
    return redirect("/login");
  }


  try {
    const res = await fetch(`${process.env.NEST_API_URL}/product/${storeId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        price,
        totalStock,
        imageUrl: imageUrl,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      return json({ error: data.message || "Erreur lors de la création" }, { status: 400 });
    }

    const created = await res.json();
    return redirect(`/dashboard/stores/${storeId}/products`);
  } catch (error) {
    console.error("Erreur lors de la création du produit :", error);
    return json({ error: "Erreur serveur" }, { status: 500 });
  }
};

export default function ProductForm() {
  const actionData = useActionData() as ActionData | undefined;

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewMode, setPreviewMode] = useState(false);

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
  };

  const removeImage = () => {
    setImageUrl("");
  };

  return (
  <div className="min-h-screen bg-while py-8 px-4">
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
    </div>
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Package className="text-orange-500" size={36} />
            Créer un nouveau produit
          </h1>
          <p className="text-gray-600">Ajoutez votre produit avec toutes ses variantes et détails</p>
        </div>

        {/* Messages d'erreur */}
        {actionData?.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-700 font-medium">{actionData.error}</p>
          </div>
        )}

        <Form
          method="post"
          encType="multipart/form-data"
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Section informations générales */}
            <div className="bg-gradient-to-r from-gray-600 to-gray-800 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <Package className="text-white" size={24} />
              Informations générales
            </h2>
            <p className="text-orange-100 mt-1">Détails de base de votre produit</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Titre et Handle */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="group">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-red-500">*</span>
                <span>Nom </span>
              </div>
                <div className="relative">
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Ex: T-shirt oversize premium"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 pl-12 text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-200 group-hover:border-gray-300"
                  />
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                  Prix
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    required
                    placeholder="Ex: 1000 F"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 pl-12 text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-200 group-hover:border-gray-300"
                  />
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>
                      <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                  Stock Total
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="totalStock"
                    required
                    placeholder="Ex: 1000 "
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 pl-12 text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-200 group-hover:border-gray-300"
                  />
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
            </div>
            </div>

            {/* Description */}
            <div className="group">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="text-red-500">*</span>
              <span>Description Du Produit</span>
            </div>
              <textarea
                name="description"
                required
                placeholder="Décrivez votre produit en détail : matériaux, caractéristiques, utilisation recommandée..."
                rows={6}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-200 resize-none group-hover:border-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">
                Une description détaillée aide vos clients à mieux comprendre votre produit
              </p>
            </div>

            {/* Image du produit */}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
                  <ImageIcon className="text-orange-500" size={24} />
                  Image du produit
                </h3>

                {!imageUrl ? (
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto">
                      <Upload className="text-gray-400" size={32} />
                    </div>
                    <UploadWidget onUpload={handleImageUpload} />
                    <p className="text-sm text-gray-600">
                      Téléchargez une image haute qualité de votre produit
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img 
                        src={imageUrl} 
                        alt="Aperçu du produit" 
                        className="w-48 h-48 object-cover rounded-2xl shadow-lg mx-auto"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <Minus size={16} />
                      </button>
                    </div>
                    <div className="flex justify-center space-x-4">
                    <UploadWidget onUpload={handleImageUpload}             
                    >
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                      >
                        <Upload size={16} className="mr-2" />
                        Changer l'image
                      </button>
                    </UploadWidget>

                    </div>
                  </div>
                )}

                <input type="hidden" name="imageUrl" value={imageUrl} />
              </div>
            </div>
          </div>


          {/* Actions */}
          <div className="bg-gray-50 px-8 py-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="text-red-500">*</span>
              <span>Champs obligatoires</span>
            </div>

            <div className="flex gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => window.history.back()}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !imageUrl}
                className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                    Création en cours...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Package className="mr-2" size={20} />
                    Créer le produit
                  </div>
                )}
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}