// app/dashboard/products/new/actions.ts
'use server';

import { getSession } from '~/utils/session.server';

export async function createProduct(formData: any, request: Request) {
  const session = await getSession(request.headers.get('Cookie'));
  const token = session.get('access_token');

  if (!token) {
    return { ok: false, error: 'Utilisateur non authentifié.' };
  }

  try {
    const res = await fetch(`${process.env.API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[createProduct] Erreur API :', data);
      return { ok: false, error: data?.message || 'Erreur inconnue' };
    }

    // Facultatif si tu veux forcer un refetch côté client
    // revalidatePath('/dashboard/products');

    return { ok: true, productId: data._id };
  } catch (err) {
    console.error('[createProduct] Exception :', err);
    return { ok: false, error: 'Erreur réseau ou serveur' };
  }
}
