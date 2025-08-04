// components/ui/FormWrapper.tsx
export default function FormWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div
        className="bg-white p-8 rounded-xl w-full max-w-3xl"
        style={{ boxShadow: "0 0 20px #a3a29fff" }}
      >
        {children}
      </div>
    </div>
  );
}
