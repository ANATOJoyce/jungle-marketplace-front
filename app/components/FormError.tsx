export default function FormError({ message }: { message: string }) {
  return (
    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
