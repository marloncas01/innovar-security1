/**
 * TEST Payment Provider
 *
 * This is a development/testing provider that simulates payment processing.
 * It does NOT connect to any real payment gateway.
 *
 * IMPORTANT: This provider is for development only. It will be replaced
 * with a real payment provider before production deployment.
 *
 * How it works:
 * - createPayment: Returns PENDING with a test transaction ID
 * - checkStatus: Returns the stored status for the transaction
 * - processWebhook: Simulates status transitions
 *
 * To simulate different scenarios in tests:
 * - Use transactionId containing "fail" → returns FAILED
 * - Use transactionId containing "process" → returns PROCESSING
 * - Default → returns PAID after first check
 */

import {
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
} from "./adapter";

const testTransactions = new Map<
  string,
  { status: string; paidAt?: Date; checks: number }
>();

export class TestPaymentProvider implements PaymentProvider {
  readonly name = "test";

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    const transactionId = `TEST-${request.paymentId.slice(0, 8)}-${Date.now()}`;

    testTransactions.set(transactionId, {
      status: "PENDING",
      checks: 0,
    });

    return {
      success: true,
      transactionId,
      reference: request.reference,
      status: "PENDING",
    };
  }

  async checkStatus(transactionId: string): Promise<PaymentStatus> {
    const record = testTransactions.get(transactionId);

    if (!record) {
      return { transactionId, status: "FAILED" };
    }

    record.checks += 1;

    if (transactionId.includes("fail")) {
      record.status = "FAILED";
    } else if (transactionId.includes("process")) {
      record.status = "PROCESSING";
    } else if (record.checks >= 2 && record.status === "PENDING") {
      record.status = "PAID";
      record.paidAt = new Date();
    }

    return {
      transactionId,
      status: record.status as PaymentStatus["status"],
      paidAt: record.paidAt,
    };
  }

  async processWebhook(
    payload: unknown
  ): Promise<PaymentStatus> {
    const data = payload as { transactionId?: string; status?: string };
    if (!data.transactionId) {
      return { transactionId: "", status: "FAILED" };
    }

    const record = testTransactions.get(data.transactionId);
    if (record && data.status) {
      record.status = data.status;
      if (data.status === "PAID") {
        record.paidAt = new Date();
      }
    }

    return {
      transactionId: data.transactionId,
      status: (record?.status || data.status || "FAILED") as PaymentStatus["status"],
      paidAt: record?.paidAt || (data.status === "PAID" ? new Date() : undefined),
    };
  }
}

/**
 * Clear test transaction store (for testing only).
 */
export function clearTestTransactions(): void {
  testTransactions.clear();
}
