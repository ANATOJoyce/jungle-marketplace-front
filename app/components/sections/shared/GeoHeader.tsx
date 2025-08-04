interface GeoHeaderProps {
  title: string;
}

export function GeoHeader({ title }: GeoHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      <div className="border-b border-gray-200 mt-2"></div>
    </header>
  );
}