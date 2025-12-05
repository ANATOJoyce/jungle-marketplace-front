export interface User {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface Store {
  id: string;
  name: string;
}

export type DashboardLoaderData = {
  token: string;
  user: {
    first_name: string;
    role: string;
  };
  store: {
    id: string;
    name: string;
  } | null;
};
