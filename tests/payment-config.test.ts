import { test } from "node:test";
import assert from "node:assert/strict";
import { getPaymentReadiness } from "../src/lib/payment-config";

test("no propone cuentas predeterminadas cuando los pagos están apagados o incompletos", () => {
  assert.equal(getPaymentReadiness({}, 100000).ready, false);
  assert.deepEqual(getPaymentReadiness({}, 100000).methods, []);
  assert.equal(getPaymentReadiness({ payment_enabled: "true" }, 100000).ready, false);
  assert.equal(getPaymentReadiness({ payment_enabled: "false", payment_nequi_number: "3044451436", payment_nequi_name: "Cuenta de prueba" }, 100000).ready, false);
});

test("exige un importe definido y ofrece solo los métodos configurados", () => {
  const settings = { payment_enabled: "true", payment_nequi_number: "3044451436", payment_nequi_name: "Cuenta de prueba" };
  for (const amount of [null, undefined, 0, -1, NaN, Infinity]) assert.equal(getPaymentReadiness(settings, amount).ready, false);
  const result = getPaymentReadiness(settings, 100000);
  assert.equal(result.ready, true);
  assert.deepEqual(result.methods, ["NEQUI"]);
  assert.equal(getPaymentReadiness({ payment_enabled: "true", payment_bancolombia_number: "Pendiente de configurar", payment_bancolombia_name: "Prueba", payment_bancolombia_type: "Ahorros" }, 100000).ready, false);
});
