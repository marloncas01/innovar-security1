/**
 * Payment Provider Adapter Interface
 *
 * This interface allows swapping payment providers without rewriting
 * appointment/booking logic. Each provider implements this interface.
 *
 * To add a new provider:
 * 1. Create a class implementing PaymentProvider
 * 2. Register it in the factory function in index.ts
 * 3. Set PAYMENT_PROVIDER in .env
 */

export interface PaymentRequest {
  paymentId: string;
  amount: number;
  currency: string;
  description: string;
  reference: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  reference?: string;
  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED";
  redirectUrl?: string;
  error?: string;
}

export interface PaymentStatus {
  transactionId: string;
  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
  paidAt?: Date;
  raw?: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: string;

  /**
   * Initiate a payment. Returns a result that may include a redirect URL
   * for the customer to complete payment on the provider's page.
   */
  createPayment(request: PaymentRequest): Promise<PaymentResult>;

  /**
   * Check the current status of a payment by its transaction ID.
   */
  checkStatus(transactionId: string): Promise<PaymentStatus>;

  /**
   * Process a webhook notification from the provider.
   * Returns the updated status.
   */
  processWebhook(payload: unknown, signature?: string): Promise<PaymentStatus>;
}
