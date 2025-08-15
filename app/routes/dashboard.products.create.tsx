import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, Form, useActionData, useNavigation } from '@remix-run/react';
import { getSession } from '~/utils/session.server';
import { useState } from 'react';

// 1. FETCH des données pour les options (type, tags, etc.)
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("access_token");
  console.log(token)

  const [ tagsRes, categoriesRes, collectionsRes] = await Promise.all([
    fetch(`${process.env.NEST_API_URL}/product/tags`, { headers: { Authorization: `Bearer ${token}` } }),
    fetch(`${process.env.NEST_API_URL}/product/categories`, { headers: { Authorization: `Bearer ${token}` } }),
    fetch(`${process.env.NEST_API_URL}/product/collections`, { headers: { Authorization: `Bearer ${token}` } }),
  ]);

  console.log('API URL:', process.env.NEST_API_URL);

  const [ tags, categories, collections] = await Promise.all([
    tagsRes.json(),
    categoriesRes.json(),
    collectionsRes.json(),
  ]);

  return json({  tags, categories, collections });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("access_token");

  const formData = await request.formData();
  const payload = Object.fromEntries(formData); // convertir FormData → objet

  const res = await fetch(`${process.env.API_URL}/product`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    return json({ ok: false, error: data?.message || 'Erreur' }, { status: res.status });
  }

  return redirect(`/dashboard/products/${data._id}/edit`);
}

export default function CreateProductPage() {
  const {  tags, categories, collections } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [step, setStep] = useState(1);

  // Gestion des valeurs localement avant envoi final
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    type: '',
    tags: [] as string[],
    categories: [] as string[],
    collection: '',
    status: 'draft',
  });

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Créer un produit</h1>

      {step === 1 && (
        <div className="space-y-4">
          <input
            name="title"
            placeholder="Nom du produit"
            className="w-full border p-2 rounded"
            value={formValues.title}
            onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
          />
          <textarea
            name="description"
            placeholder="Description"
            className="w-full border p-2 rounded"
            value={formValues.description}
            onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
          />
          <button onClick={handleNext} className="bg-blue-600 text-white px-4 py-2 rounded">
            Suivant
          </button>
        </div>
      )}

      {step === 2 && (
        <Form method="post">
          {/* Remplissage automatique des champs via JS */}
          {Object.entries(formValues).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={Array.isArray(value) ? JSON.stringify(value) : value} />
          ))}
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            {navigation.state === 'submitting' ? 'Création...' : 'Créer le produit'}
          </button>
        </Form>
      )}

      {actionData?.error && (
        <p className="text-red-500 mt-4">{actionData.error}</p>
      )}
    </div>
  );
}

