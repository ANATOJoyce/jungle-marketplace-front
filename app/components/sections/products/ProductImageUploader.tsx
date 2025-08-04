"use client";

import { useRef } from "react";

type Props = {
  onUpload: (urls: string[]) => void;
};

export function ProductImageUploader({ onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "Jungle"); // Ton upload preset Cloudinary
      formData.append("folder", "samples/ecommerce"); // Fac. organisation des assets

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/ds8qdsews/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        uploadedUrls.push(data.secure_url);
      }
    }

    if (uploadedUrls.length > 0) {
      onUpload(uploadedUrls);
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="w-full border p-2 rounded"
      />
      <p className="text-sm text-gray-500 mt-1">
        Upload direct vers Cloudinary. Plusieurs fichiers autorisés.
      </p>
    </div>
  );
}
