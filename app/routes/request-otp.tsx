import { useState } from "react";
import { FiLogIn } from "react-icons/fi";
import { FormInput } from "~/components/FormInput";
import { Button } from "~/components/ui/Button";

export default function RequestOtp() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

      const res = await fetch(`${window.ENV.PUBLIC_NEST_API_URL}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),//request-otp
    });

    if (res.ok) {
      setSuccess(true);
    } else {
      alert("Erreur lors de l'envoi du code OTP.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <img src="/Jungle_logo05.png" alt="" />
      <div className="max-w-md w-full p-6 bg-white rounded-2xl shadow-[0_0_20px_#a3a29fff]">
        <h1 className="text-xl font-bold mb-4 text-center">VOTRE MAIL</h1>

        {success ? (
          <p className="text-green-600 text-center mb-4">
            verifier votre mail {email}. <a href={`/verify-otp?email=${encodeURIComponent(email)}`} className="text-yellow-600 underline">Vérifier le code</a>
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button  className="w-full" >
              {loading ? "Envoi en cours..." : "Envoyer le code OTP"}
            </Button>
          </form>
        )}

        <div className="text-center mt-6 text-gray-600">
          Vous avez déjà un compte ?{" "}
          <a 
            href="/login" 
            className="text-orange-600 font-medium hover:underline flex items-center justify-center"
          >
            <FiLogIn className="mr-1" /> Se connecter
          </a>
        </div>
      </div>
    </div>
  );
}
