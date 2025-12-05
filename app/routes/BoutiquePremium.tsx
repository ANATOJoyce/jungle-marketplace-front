import { useEffect, useState } from "react";
import { Button } from "~/components/ui/Button";

export default function PremiumPopup() {
  const [isOpen, setIsOpen] = useState(false);

  // Afficher le popup après 3 secondes
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-in fade-in-50 zoom-in-95">
        
        {/* Bouton fermer */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Contenu */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          Passez à la version <span className="text-orange-600">Premium</span>
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Multipliez vos opportunités de vente 🚀<br />
          Avec Premium, vous aurez accès à plus de visibilité, des outils avancés
          et un meilleur accompagnement.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => (window.location.href = "/premium")}
            className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
          >
            Découvrir Premium
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsOpen(false)}
            className="flex-1"
          >
            Peut-être plus tard
          </Button>
        </div>

        {/* Bonus: confiance */}
        <div className="mt-6 text-sm text-gray-500 text-center">
          🔒 Paiement 100% sécurisé - Annulation possible à tout moment
        </div>
      </div>
    </div>
  );
}
