import {
  Check,
  Crown,
  Package,
  ShoppingBag,
  Star,
  MessageCircle,
  Bot,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { FaWhatsapp, FaTelegramPlane, FaFacebookMessenger } from "react-icons/fa";

import {
  FiMessageSquare,
  FiShoppingBag,
  FiPackage,
  FiUser,
  FiLogIn,
  FiCreditCard,
  FiEye,
  FiEyeOff,
  FiLock,
  FiUserPlus,
} from "react-icons/fi";
import { Button } from "~/components/ui/Button";
import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { getSession, commitSession } from "~/utils/session.server";
import { jwtDecode } from "jwt-decode";

// --- Validation utilities ---
const validateLogin = (
  login: string
): { isValid: boolean; error?: string } => {
  if (!login.trim())
    return { isValid: false, error: "L'identifiant est requis" };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(\+?\d{8,15})$/;
  if (
    emailRegex.test(login) ||
    phoneRegex.test(login.replace(/\s+/g, ""))
  )
    return { isValid: true };
  return {
    isValid: false,
    error: "Format invalide. Utilisez un email ou un numéro de téléphone",
  };
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

    if (!res.ok) {
      return json(
        { errors: { general: data.message || "Erreur d'authentification" } },
        { status: res.status }
      );
    }

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

    const session = await getSession(request.headers.get("Cookie"));
    session.set("token", data.access_token);
    session.set("user", data.user);
    session.set("role", userRole);

    let redirectTo = "/dashboard";
    if (userRole === "ADMIN") redirectTo = "/admin/dashboard";
    else if (userRole === "MANAGER") redirectTo = "/manager";
    else if (userRole === "VENDOR") redirectTo = "/dashboard";

    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await commitSession(
          session,
          rememberMe ? { maxAge: 2592000 } : undefined
        ),
      },
    });
  } catch (err) {
    console.error("Erreur login:", err);
    return json({ errors: { general: "Erreur serveur." } }, { status: 500 });
  }
};

export default function HomePage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [formData, setFormData] = useState({
    login: "",
    password: "",
    rememberMe: false,
  });
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
        setClientErrors((prev) => ({
          ...prev,
          login: loginValidation.error!,
        }));
    }
  };

  const plans = [
    {
      name: "Gratuite",
      price: "0",
      period: "Toujours",
      discount: null,
      description: "Parfait pour débuter",
      icon: ShoppingBag,
      features: [
        "1 boutique incluse",
        "Produits illimités",
        "Interface simple et intuitive",
        "Support communautaire",
        "Analytics de base",
      ],
      buttonText: "Commencer gratuitement",
      buttonStyle:
        "bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white",
      popular: false,
    },
    {
      name: "Premium",
      price: "29.99",
      period: "par mois",
      discount: "40% de réduction",
      description: "Pour les entrepreneurs ambitieux",
      icon: Package,
      features: [
        "Jusqu'à 3 boutiques",
        "Thèmes personnalisables avancés",
        "Analytics détaillées",
        "Support prioritaire par email",
        "Intégrations tierces",
        "Gestion multi-devises",
      ],
      buttonText: "Essayer 14 jours gratuits",
      buttonStyle:
        "bg-gradient-to-r from-[#fbb344] to-[#f59e0b] hover:from-[#faa533] hover:to-[#e08e00] text-white",
      popular: true,
    },
    {
      name: "VIP",
      price: "89.99",
      period: "par mois",
      discount: "30% de réduction",
      description: "Solution complète pour experts",
      icon: Crown,
      features: [
        "Boutiques illimitées",
        "White-label complet",
        "API complète et webhooks",
        "Support téléphonique dédié",
        "Formation personnalisée",
        "Gestionnaire de compte dédié",
        "Sauvegardes automatiques",
      ],
      buttonText: "Contacter l'équipe",
      buttonStyle:
        "bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white",
      popular: false,
    },
  ];

  const [showPremium, setShowPremium] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowPremium(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header moderne */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#fbb344] to-[#f59e0b] rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#fbb344] to-[#f59e0b] bg-clip-text text-transparent">
              Jungle
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-700 hover:text-[#fbb344] font-medium transition-colors"
            >
              Fonctionnalités
            </a>
            <a
              href="#pricing"
              className="text-gray-700 hover:text-[#fbb344] font-medium transition-colors"
            >
              Tarifs
            </a>
            <a
              href="#vendors"
              className="text-gray-700 hover:text-[#fbb344] font-medium transition-colors"
            >
              Vendeurs
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => (window.location.href = "/register")}
              className="flex items-center text-gray-700 hover:text-[#fbb344] font-medium transition-colors"
            >
              <FiUserPlus className="mr-2" /> Inscription
            </button>
            <button
              onClick={() => (window.location.href = "/login")}
              className="bg-gradient-to-r from-[#fbb344] to-[#f59e0b] hover:from-[#faa533] hover:to-[#e08e00] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FiLogIn className="mr-2" />
              Connexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section Moderne */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
          {/* Cercles décoratifs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#fbb344] rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f59e0b] rounded-full opacity-10 blur-3xl"></div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Texte */}
              <div className="text-white space-y-8">
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Sparkles className="w-5 h-5 text-[#fbb344]" />
                  <span className="text-sm font-medium">Marketplace intelligente</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  Shopping
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#fbb344] to-[#f59e0b]">
                    Conversationnel
                  </span>
                </h1>

                <p className="text-xl text-gray-300 max-w-xl">
                  Discutez avec notre chatbot IA. Il comprend vos besoins et trouve les produits parfaits pour vous.
                </p>

                <div className="flex flex-wrap gap-4">
                  <button className="px-8 py-4 bg-gradient-to-r from-[#fbb344] to-[#f59e0b] hover:from-[#faa533] hover:to-[#e08e00] text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                    Essayer gratuitement
                  </button>
                  <button className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all">
                    Voir la démo
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8">
                  <div>
                    <div className="text-3xl font-bold text-[#fbb344]">10k+</div>
                    <div className="text-sm text-gray-400">Utilisateurs actifs</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#fbb344]">500+</div>
                    <div className="text-sm text-gray-400">Vendeurs</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#fbb344]">98%</div>
                    <div className="text-sm text-gray-400">Satisfaction</div>
                  </div>
                </div>
              </div>

              {/* Carte de conversation améliorée */}
                <div className="relative">
              {/* Logos flottants autour */}
          {/* Logos flottants autour */}
          <div className="absolute -top-6 -left-6 animate-bounce mb-6 drop-shadow-lg">
            <FaWhatsapp className="w-20 h-20 text-green-600" />
          </div>
          <div className="absolute -top-6 -right-6 animate-bounce mb-6 drop-shadow-lg">
            <FaTelegramPlane className="w-20 h-20 text-blue-400" />
          </div>
          <div className="absolute -bottom-6 -left-6 animate-bounce-slow delay-400">
            <FaFacebookMessenger className="w-20 h-20 text-blue-600 animate-bounce mb-6 drop-shadow-lg" />
          </div>
          

            <div className="bg-gray-100 rounded-3xl shadow-3xl p-8 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-[#fbb344] to-[#f59e0b] rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-800">JungleBot</div>
                  <div className="text-sm text-green-500 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    En ligne
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-300 rounded-2xl rounded-tl-none p-4">
                  <p className="text-gray-800">
                    Bonjour !  Comment puis-je vous aider aujourd'hui ?
                  </p>
                </div>

                <div className="bg-gradient-to-r from-[#fbb344] to-[#f59e0b] rounded-2xl rounded-tr-none p-4 ml-12">
                  <p className="text-white">Je cherche un ordinateur portable pour étudiant</p>
                </div>

                <div className="bg-gray-300 rounded-2xl rounded-tl-none p-4">
                  <p className="text-gray-800 mb-3">
                    Parfait ! J'ai trouvé 3 modèles adaptés à vos besoins. Quel est votre budget ?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      500 CFA
                    </button>
                    <button className="px-4 py-2 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      500-800 CFA
                    </button>
                    <button className="px-4 py-2 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      800 CFA
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                <input
                  type="text"
                  placeholder="Tapez votre message..."
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-[#fbb344] outline-none"
                />
                <button className="p-3 bg-gradient-to-r from-[#fbb344] to-[#f59e0b] text-white rounded-xl hover:shadow-lg transition-all">
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

            </div>
          </div>
        </section>

        {/* Avantages clés */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Pourquoi choisir <span className="text-[#fbb344]">Jungle</span> ?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Gérez votre boutique avec une suite complète d'outils professionnels
              </p>
            </div>

            <div className="space-y-20">
              {[
                {
                  title: "Gestion des produits",
                  desc: "Ajoutez, modifiez et organisez vos produits avec une interface intuitive. Import en masse, catégories personnalisées et gestion des stocks en temps réel.",
                  img: "/produits.png",
                  features: ["Import CSV", "Gestion des variantes", "Stock automatisé"],
                },
                {
                  title: "Suivi des commandes",
                  desc: "Tableau de bord complet pour suivre toutes vos ventes. Notifications instantanées et gestion des expéditions simplifiée.",
                  img: "/Commande.png",
                  features: ["Statuts en temps réel", "Notifications push", "Export des données"],
                },
                {
                  title: "Base clients",
                  desc: "Analysez les comportements d'achat et fidélisez votre clientèle avec des outils marketing avancés.",
                  img: "/Clients.png",
                  features: ["Segmentation client", "Historique d'achat", "Campagnes ciblées"],
                },
                {
                  title: "Configuration boutique",
                  desc: "Personnalisez votre boutique : horaires, modes de paiement, zones de livraison et bien plus encore.",
                  img: "/boutique.png",
                  features: ["Multi-devises", "Paiements flexibles", "Design personnalisé"],
                },
                {
                  title: "Profil vendeur",
                  desc: "Gérez vos informations, paramètres de sécurité et préférences de notification depuis un espace centralisé.",
                  img: "/Profile.png",
                  features: ["Authentification 2FA", "Gestion d'équipe", "Personnalisation"],
                },
                {
                  title: "Analytics avancées",
                  desc: "Tableaux de bord dynamiques avec métriques en temps réel. Visualisez vos performances et optimisez votre stratégie.",
                  img: "/stats.png",
                  features: ["Rapports détaillés", "Prévisions IA", "Export personnalisé"],
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
                  } items-center gap-12`}
                >
                  {/* Image */}
                  <div className="lg:w-1/2 w-full">
                    <div className="relative group overflow-hidden rounded-3xl shadow-2xl">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-96 object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="flex flex-wrap gap-2">
                          {item.features.map((feature, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Texte */}
                  <div className="lg:w-1/2 text-center lg:text-left">
                    <div className="inline-flex items-center space-x-2 bg-[#fbb344]/10 px-4 py-2 rounded-full mb-4">
                      <Sparkles className="w-5 h-5 text-[#fbb344]" />
                      <span className="text-sm font-semibold text-[#fbb344]">
                        Outil professionnel
                      </span>
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-4">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                      {item.desc}
                    </p>
                    <button className="px-8 py-4 bg-gradient-to-r from-[#fbb344] to-[#f59e0b] hover:from-[#faa533] hover:to-[#e08e00] text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                      En savoir plus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Vendeur */}
            <div className="mt-20 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-center text-white shadow-2xl">
              <h3 className="text-3xl font-bold mb-4">
                Prêt à développer votre activité ?
              </h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Rejoignez des centaines de vendeurs qui font confiance à Jungle pour développer leur business
              </p>
              <button className="px-10 py-5 bg-gradient-to-r from-[#fbb344] to-[#f59e0b] hover:from-[#faa533] hover:to-[#e08e00] text-white rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
                Devenir vendeur
              </button>
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Ils nous font <span className="text-[#fbb344]">confiance</span>
              </h2>
              <p className="text-xl text-gray-600">
                Des milliers d'utilisateurs satisfaits
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Marie Dubois",
                  role: "Acheteuse régulière",
                  avatar: "M",
                  rating: 5,
                  text: "Le chatbot comprend exactement ce que je cherche. Plus besoin de passer des heures à chercher !",
                },
                {
                  name: "Thomas Martin",
                  role: "Vendeur Pro",
                  avatar: "T",
                  rating: 5,
                  text: "Les outils de gestion sont incroyables. J'ai triplé mes ventes en 3 mois grâce à Jungle.",
                },
                {
                  name: "Sophie Laurent",
                  role: "Entrepreneuse",
                  avatar: "S",
                  rating: 5,
                  text: "Interface intuitive et support réactif. Exactement ce qu'il faut pour gérer ma boutique.",
                },
              ].map((testimonial, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-[#fbb344] text-[#fbb344]"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#fbb344] to-[#f59e0b] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-gradient-to-br from-[#fbb344] via-[#f59e0b] to-[#fbb344]">
          <div className="container mx-auto px-6 text-center text-white">
            <h2 className="text-5xl font-bold mb-6">
              Commencez votre aventure dès aujourd'hui
            </h2>
            <p className="text-2xl mb-10 opacity-90 max-w-3xl mx-auto">
              Rejoignez la révolution du shopping conversationnel. Gratuit, sans engagement.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <button className="px-10 py-5 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105">
                Créer mon compte gratuitement
              </button>
              <button className="px-10 py-5 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105">
                Contacter l'équipe
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer moderne */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Logo et description */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#fbb344] to-[#f59e0b] rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Jungle</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                La marketplace conversationnelle qui révolutionne le e-commerce.
              </p>
            </div>

            {/* Liens */}
            <div>
              <h4 className="font-bold text-lg mb-4">Produit</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbb344] transition-colors"
                  >
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbb344] transition-colors"
                  >
                    Tarifs
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbb344] transition-colors"
                  >
                    Démo
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbb344] transition-colors"
                  >
                    Tutoriels
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Entreprise</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbb344] transition-colors"
                  >
                    À propos
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbb344] transition-colors"
                  >
                    Carrières
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbb344] transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbb344] transition-colors"
                  >
                    Presse
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbb344] transition-colors"
                  >
                    Centre d'aide
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbb344] transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbb344] transition-colors"
                  >
                    Confidentialité
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbb344] transition-colors"
                  >
                    Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} Jungle. Tous droits réservés.
            </p>
            <div className="flex space-x-6">
              {/* Twitter */}
              <a
                href="#"
                className="text-gray-400 hover:text-[#fbb344] transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="#"
                className="text-gray-400 hover:text-[#fbb344] transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="#"
                className="text-gray-400 hover:text-[#fbb344] transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Popup Premium */}
      {showPremium && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative animate-in fade-in-50 zoom-in-95">
            <button
              onClick={() => setShowPremium(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#fbb344] to-[#f59e0b] rounded-full mx-auto mb-4 flex items-center justify-center">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Passez à <span className="text-[#fbb344]">Premium</span>
              </h2>
              <p className="text-gray-600">
                Débloquez tout le potentiel de votre boutique
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {[
                "Jusqu'à 3 boutiques",
                "Analytics avancées",
                "Support prioritaire 24/7",
                "Thèmes premium illimités",
              ].map((feature, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#fbb344] to-[#f59e0b] rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => (window.location.href = "/BoutiquePremium")}
                className="w-full py-4 bg-gradient-to-r from-[#fbb344] to-[#f59e0b] hover:from-[#faa533] hover:to-[#e08e00] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Essayer 14 jours gratuits
              </button>
              <button
                onClick={() => setShowPremium(false)}
                className="w-full py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
              >
                Plus tard
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              🔒 Paiement sécurisé • Annulation à tout moment
            </p>
          </div>
        </div>
      )}
    </div>
  );

  
}
