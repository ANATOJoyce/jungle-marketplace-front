import { LoaderFunctionArgs, json } from "@remix-run/node";
import { getSession } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("access_token");

  const [typesRes, tagsRes, categoriesRes, collectionsRes] = await Promise.all([
    fetch(`${process.env.API_URL}/product-types`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`${process.env.API_URL}/product-tags`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`${process.env.API_URL}/product-categories`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`${process.env.API_URL}/product-collections`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  if (
    !typesRes.ok ||
    !tagsRes.ok ||
    !categoriesRes.ok ||
    !collectionsRes.ok
  ) {
    throw new Response("Erreur lors du chargement des données", { status: 500 });
  }

  const [types, tags, categories, collections] = await Promise.all([
    typesRes.json(),
    tagsRes.json(),
    categoriesRes.json(),
    collectionsRes.json(),
  ]);

  return json({
    types,
    tags,
    categories,
    collections,
  });
}
