/**
 * Payment module index
 *
 * Factory function to get the configured payment provider.
 * Provider is determined by PAYMENT_PROVIDER env var.
 */

import { PaymentProvider } from "./adapter";
import { TestPaymentProvider } from "./test-provider";

let providerInstance: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (providerInstance) return providerInstance;

  const providerName = process.env.PAYMENT_PROVIDER || "test";

  switch (providerName) {
    case "test":
      providerInstance = new TestPaymentProvider();
      break;
    // Future providers will be added here:
    // case "nequi":
    //   providerInstance = new NequiPaymentProvider();
    //   break;
    default:
      console.warn(
        `Unknown payment provider "${providerName}", falling back to test`
      );
      providerInstance = new TestPaymentProvider();
  }

  return providerInstance;
}

/**
 * Reset provider instance (for testing only).
 */
export function resetPaymentProvider(): void {
  providerInstance = null;
}

export type { PaymentProvider, PaymentRequest, PaymentResult, PaymentStatus } from "./adapter";
