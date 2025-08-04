// types/return-reason.ts

export interface ReturnReason {
  id: string;
  value: string;
  label: string;
  description?: string;
  metadata?: Record<string, unknown>;
  parent_return_reason?: string | ReturnReason; // Peut être un objet ou un ID de raison parente
  return_reason_children: (string | ReturnReason)[]; // Liste d'ID ou d'objets de sous-raisons
  deleted_at?: string | null; // Date de suppression, si applicable
}
