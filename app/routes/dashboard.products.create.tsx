// app/routes/dashboard.product.create.tsx
import { Form, useLoaderData } from "@remix-run/react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useForm, FormProvider } from "react-hook-form";
import { Step2Organization } from "~/components/sections/products/form-step2-organization";
import { Step1Details } from "~/components/sections/products/form-step1-details";
import { Step4InventoryKits } from "~/components/sections/products/form-step4-inventory-kits";
import { Step5Finalization } from "~/components/sections/products/form-step5-finalization";
import ProductVariantForm from "~/components/sections/products/VariantForm";

export async function loader({ request }: LoaderFunctionArgs) {
  const baseUrl = process.env.API_URL || "http://localhost:3000";

  const [types, collections, categories, shippingProfiles, salesChannels, inventoryItems] =
    await Promise.all([
      fetch(`${baseUrl}/product/product-types`).then((res) => res.json()),
      fetch(`${baseUrl}/product/collections`).then((res) => res.json()),
      fetch(`${baseUrl}/product/categories`).then((res) => res.json()),
      fetch(`${baseUrl}/fufillment/shipping-profiles`).then((res) => res.json()),
      fetch(`${baseUrl}/sales-channel`).then((res) => res.json()),
      fetch(`${baseUrl}/inventory`).then((res) => res.json()),
    ]);

  return json({
    types,
    collections,
    categories,
    shippingProfiles,
    salesChannels,
    inventoryItems,
  });
}

  // Dummy data ou récupérer selon ton contexte
  const currencies = [{ code: "USD", symbol: "$" }]; 
  const regions = [{ id: "us", name: "United States" }];

export default function CreateProductPage() {
  const {
    types,
    collections,
    categories,
    shippingProfiles,
    salesChannels,
    inventoryItems,
  } = useLoaderData<typeof loader>();

  const form = useForm();

  return (
    <FormProvider {...form}>
      <Form method="post" className="max-w-3xl mx-auto space-y-8">
        <Step1Details />
        <Step2Organization
          types={types}
          collections={collections}
          categories={categories}
          shippingProfiles={shippingProfiles}
          salesChannels={salesChannels}
        />
        <ProductVariantForm
          currencies={currencies}
          regions={regions}
          onSave={handleSave}
          onCancel={handleCancel}
        />        <Step4InventoryKits inventoryItems={inventoryItems} />
        <Step5Finalization />
      </Form>
    </FormProvider>
  );
}
