import { getSession } from "./session.server";

export async function getAuthToken(request: Request): Promise<string> {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("accessToken");
  
  if (!token) {
    throw new Response("Unauthorized", { status: 401 });
  }
  
  return token;
}