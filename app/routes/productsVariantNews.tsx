// app/routes/variants/new.tsx
import { json, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import type { ActionFunction } from '@remix-run/node';
import ProductVariantForm from '~/components/sections/products/VariantForm';
import { useState } from 'react';

interface ActionData {
  error?: {
    message: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  
  const payload = {
    title: formData.get('title'),
    sku: formData.get('sku'),
    // ... (tous les autres champs)
    prices: JSON.parse(formData.get('prices') as string)
  };

  try {
    const response = await fetch('http://localhost:3000/product/create-variant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return json({ error: errorData });
    }

    return redirect('/variants');
  } catch (error) {
    return json({ error: { message: 'Erreur réseau' } });
  }
};

export default function NewVariant() {
  const actionData = useActionData<ActionData>();
  const [products] = useState([
    { id: '1', name: 'Produit 1' },
    { id: '2', name: 'Produit 2' }
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Nouvelle Variante</h2>
      
      <ProductVariantForm 
        currencies={[
          { code: 'EUR', name: 'Euro' },
          { code: 'USD', name: 'Dollar US' },
          { code: 'CFA', name: 'Franc CFA' }
        ]}
        regions={[
          { id: 'eu', name: 'Europe' },
          { id: 'us', name: 'États-Unis' },
          { id: 'af', name: 'Afrique' }
        ]}
        onSave={async (formData) => {
          // Soumission via Remix
          const form = document.getElementById('variant-form') as HTMLFormElement;
          const formDataObj = new FormData(form);
          
          // Ajoute les prix au FormData
          formDataObj.set('prices', JSON.stringify(formData.prices));
          
          await fetch(form.action, {
            method: 'POST',
            body: formDataObj
          });
        }}
        onCancel={() => window.history.back()}
      />

      {/* Formulaire caché pour la soumission Remix */}
      <Form 
        id="variant-form" 
        method="post" 
        action="/variants/new"
        className="hidden"
      >
        {products.map(product => (
          <option key={product.id} value={product.id}>
            {product.name}
          </option>
        ))}
      </Form>

      {actionData?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {actionData.error.message}
        </div>
      )}
    </div>
  );
}