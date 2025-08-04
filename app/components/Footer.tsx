// components/ui/Footer.tsx

export default function Footer() {
  return (
    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
      <div className="flex items-center justify-center text-xs text-gray-500">
        <svg
          className="w-4 h-4 mr-2 text-yellow-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        Connexion sécurisée SSL
      </div>
    </div>
  );
}
