import {
  json,
  redirect,
  type ActionFunction,
  type LoaderFunction,
} from "@remix-run/node";
import { useActionData, Form, useNavigation, Link } from "@remix-run/react";
import { useState } from "react";
import { getSession } from "~/utils/session.server";
import { FiMail, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiSend } from "react-icons/fi";

type ActionData = {
  errors?: Record<string, string>;
  success?: string;
};

// Email validation utility
const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email.trim()) {
    return { isValid: false, error: "L'adresse email est requise" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Format d'email invalide" };
  }

  return { isValid: true };
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  
  if (token) {
    // Redirige vers dashboard si déjà connecté
    return redirect("/dashboard");
  }
  
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString()?.trim().toLowerCase();

  // Server-side validation
  const errors: Record<string, string> = {};

  if (!email) {
    errors.email = "L'adresse email est requise";
  } else {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error!;
    }
  }

  if (Object.keys(errors).length > 0) {
    return json<ActionData>({ errors }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.NEST_API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      let errorMessage = "Impossible d'envoyer le lien de réinitialisation.";
      
      if (res.status === 404) {
        errorMessage = "Aucun compte associé à cette adresse email.";
      } else if (res.status === 429) {
        errorMessage = "Trop de demandes. Veuillez réessayer dans quelques minutes.";
      } else if (res.status >= 500) {
        errorMessage = "Erreur du serveur. Veuillez réessayer plus tard.";
      }

      return json<ActionData>({
        errors: { general: data.message || errorMessage }
      }, { status: res.status });
    }

    return json<ActionData>({
      success: "Un lien de réinitialisation a été envoyé à votre adresse email. Vérifiez votre boîte de réception et vos spams."
    });

  } catch (error) {
    console.error("Erreur forgot-password:", error);
    return json<ActionData>({
      errors: { general: "Erreur de connexion au serveur. Vérifiez votre connexion internet." }
    }, { status: 500 });
  }
};

export default function ForgotPasswordPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [emailSent, setEmailSent] = useState(false);
  
  const isSubmitting = navigation.state === "submitting";

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Clear client-side errors when user starts typing
    if (clientErrors.email) {
      setClientErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }

    // Real-time email validation
    if (value.trim()) {
      const emailValidation = validateEmail(value);
      if (!emailValidation.isValid) {
        setClientErrors(prev => ({
          ...prev,
          email: emailValidation.error!
        }));
      }
    }
  };

  const errors = actionData?.errors || {};
  const allErrors = { ...errors, ...clientErrors };

  // Set email sent state when success message is received
  if (actionData?.success && !emailSent) {
    setEmailSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 px-4">
      <div className="max-w-md w-full p-8 shadow-[0_0_30px_rgba(251,146,60,0.15)] rounded-3xl bg-white border border-orange-100">
        
        {/* Back to Login Link */}
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-orange-600 transition-colors group"
          >
            <FiArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Retour à la connexion
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            {emailSent ? (
              <FiCheckCircle className="text-white text-2xl" />
            ) : (
              <FiMail className="text-white text-2xl" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {emailSent ? "Email envoyé !" : "Mot de passe oublié ?"}
          </h1>
          <p className="text-gray-600">
            {emailSent 
              ? "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe."
              : "Entrez votre adresse email pour recevoir un lien de réinitialisation."
            }
          </p>
        </div>

        {/* Success Message */}
        {actionData?.success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiCheckCircle className="h-5 w-5 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{actionData.success}</p>
                <p className="text-sm mt-2">
                  Vous n'avez pas reçu l'email ? 
                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setEmail("");
                    }}
                    className="ml-1 font-semibold underline hover:no-underline"
                  >
                    Réessayer
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {allErrors.general && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{allErrors.general}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form - Hide if email was sent successfully */}
        {!emailSent && (
          <Form method="post" className="space-y-6" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse email
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="votre@email.com"
                  aria-invalid={!!allErrors.email}
                  aria-describedby={allErrors.email ? "email-error" : "email-help"}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                    allErrors.email 
                      ? "border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50" 
                      : "border-gray-300 focus:border-orange-500 focus:ring-orange-200 bg-gray-50"
                  } focus:ring-4 focus:outline-none placeholder-gray-500`}
                />
              </div>
              <p id="email-help" className="text-xs text-gray-500 mt-2">
                Nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe
              </p>
              {allErrors.email && (
                <p id="email-error" className="text-red-500 text-sm mt-2 flex items-center" role="alert">
                  <FiAlertCircle className="h-4 w-4 mr-1" />
                  {allErrors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !!clientErrors.email || !email.trim()}
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-orange-200 shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FiSend className="mr-2 h-5 w-5" />
                  Envoyer le lien
                </div>
              )}
            </button>
          </Form>
        )}

        {/* Actions after email sent */}
        {emailSent && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
              className="w-full py-3 border-2 border-orange-300 text-orange-600 font-medium rounded-xl hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-orange-200"
            >
              Envoyer à une autre adresse
            </button>
            
            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
              >
                Retour à la page de connexion
              </Link>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Besoin d'aide ?</p>
            <div className="flex justify-center space-x-4 text-sm">
              <a
                href="/support"
                className="text-orange-600 hover:text-orange-700 hover:underline transition-colors"
              >
                Support technique
              </a>
              <span className="text-gray-400">•</span>
              <a
                href="/contact"
                className="text-orange-600 hover:text-orange-700 hover:underline transition-colors"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}