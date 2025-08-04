import { useState } from "react";
import { useSearchParams, useNavigate } from "@remix-run/react";
import { FormInput } from "~/components/FormInput";
import { Button } from "~/components/ui/Button";

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEST_API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("access_token", data.access_token);
        navigate(`/dashboard-page?email=${encodeURIComponent(email)}`);
      } else {
        alert("Code incorrect ou expiré.");
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full p-6 bg-white rounded-2xl shadow-[0_0_20px_#a3a29fff]">
        <h1 className="text-xl font-bold mb-4 text-center">Entrer le code</h1>
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <FormInput
            label="Code reçu par mail"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <Button className="w-full">
            {loading ? "Vérification..." : "Vérifier le code"}
          </Button>
        </form>
      </div>
    </div>
  );
}
