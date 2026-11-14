import test from "node:test";
import assert from "node:assert/strict";
import { legalAcceptanceSchema, LEGAL_VERSION } from "../src/lib/legal";
test("el registro exige autorizaciones explícitas separadas y mayoría de edad", () => {
  const valid = { acceptedTerms: true, acceptedPrivacy: true, isAdult: true };
  assert.ok(legalAcceptanceSchema.safeParse(valid).success);
  for (const key of Object.keys(valid)) {
    assert.equal(
      legalAcceptanceSchema.safeParse({ ...valid, [key]: false }).success,
      false,
    );
    assert.equal(
      legalAcceptanceSchema.safeParse({ ...valid, [key]: "true" }).success,
      false,
    );
    const incomplete = { ...valid };
    delete incomplete[key as keyof typeof valid];
    assert.equal(legalAcceptanceSchema.safeParse(incomplete).success, false);
  }
  assert.match(LEGAL_VERSION, /^\d{4}-\d{2}-\d{2}$/);
});

import { getPaymentProvider } from "../src/lib/payments";
test("el proveedor simulado no puede operar en el sitio publicado", () => {
  const environment = process.env as Record<string, string | undefined>;
  const previous = environment.NODE_ENV;
  environment.NODE_ENV = "production";
  try {
    assert.throws(() => getPaymentProvider(), /deshabilitada/);
  } finally {
    if (previous === undefined) delete environment.NODE_ENV;
    else environment.NODE_ENV = previous;
  }
});
