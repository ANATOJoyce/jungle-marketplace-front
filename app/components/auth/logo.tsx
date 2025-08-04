// components/Logo.tsx

   
    interface LogoProps {
    className?: string;
    size?: "sm" | "md" | "lg";
    }

  

export function Logo({ className = "", size = "md" }: LogoProps) {

    const sizes = {
    sm: { img: "h-10 w-10", text: "text-lg" },
    md: { img: "h-12 w-12", text: "text-xl" },
    lg: { img: "h-16 w-16", text: "text-2xl" },
    };

  return (
    <>
      <img 
        src="/VendorCustomer.png" 
        alt="Vendeur" 
        className="w-32 h-32 mb-4 rounded-full object-cover border-4 border-orange-300 shadow-md" 
      />
      <h1 className="text-2xl font-bold text-orange-600 mb-2">Jungle Vendeur</h1>
      
    </>
  );
}
