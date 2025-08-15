import { Region } from "./region";

export interface Country {
  id: string;            // correspond à _id mongoose
  iso_2: string;         // code iso 2 lettres
  iso_3: string;         // code iso 3 lettres
  num_code: string;      // code numérique
  name: string;          // nom (indexé)
  display_name: string;  // nom complet affiché
  region?: Region ;  // id ou objet Region référencé
  metadata?: Record<string, unknown>;
}
