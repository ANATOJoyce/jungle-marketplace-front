// app/components/ui/ImageUploader.tsx
import { useRef } from "react";

type Props = {
  onUpload: (urls: string[]) => void;
  vendorId: string;
  productId: string;
};

export function ImageUploader({ onUpload, vendorId, productId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "Jungle");
      formData.append("folder", `vendors/${vendorId}/products/${productId}`);

      const res = await fetch("https://api.cloudinary.com/v1_1/ds8qdsews/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        uploadedUrls.push(data.secure_url);
      }
    }

    onUpload(uploadedUrls);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 rounded-md bg-indigo-600 text-white"
      >
        Ajouter des images
      </button>
    </div>
  );
}
