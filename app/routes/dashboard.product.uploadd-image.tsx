// routes/dashboard/products/upload-image.tsx
import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get("file") as unknown as File;

  if (!file) {
    return json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const uploadResponse = await fetch(`${process.env.NEST_API_URL}/product/image`, {
      method: "POST",
      body: formData, // forward the FormData to NestJS
    });

    const result = await uploadResponse.json();
    return json(result);
  } catch (err) {
    return json({ error: "Upload failed" }, { status: 500 });
  }
};
