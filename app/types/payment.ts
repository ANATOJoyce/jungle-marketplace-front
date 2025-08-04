export interface Payment {
  amount: number;
  currency_code: string;
  provider_id: string;
  data?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  captured_at?: Date | null;
  canceled_at?: Date | null;

  payment_collection: string; // ou PaymentCollection
  payment_session?: string | null; // ou PaymentSession
  refunds?: string[]; // ou Refund[]
  captures?: string[]; // ou Capture[]

  status: 'pending' | 'captured' | 'refunded';
  vendor_phone?: string;

  createdAt: string;
  updatedAt: string;
}
