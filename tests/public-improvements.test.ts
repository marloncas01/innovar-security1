import { test } from "node:test";
import assert from "node:assert/strict";
import { signUpSchema, signInSchema } from "../src/lib/validators";
import { safeCallbackPath, publicPages } from "../src/lib/site";
import { schemaForDatabase } from "../scripts/database-config.mjs";

const valid = { name: "  Cliente de prueba  ", email: " CLIENTE@EXAMPLE.COM ", phone: "+57 (304) 445-1436", password: "prueba-segura" };

test("normaliza email, nombre y teléfono antes de guardar una cuenta", () => {
  const result = signUpSchema.parse(valid);
  assert.equal(result.name, "Cliente de prueba");
  assert.equal(result.email, "cliente@example.com");
  assert.equal(result.phone, "+573044451436");
  assert.equal(signInSchema.parse({ email: valid.email, password: valid.password }).email, result.email);
});

test("rechaza tipos inválidos y contraseñas truncables por bcrypt", () => {
  for (const value of [null, {}, { ...valid, email: 123 }, { ...valid, phone: "no tengo" }, { ...valid, password: "🙂".repeat(19) }]) {
    assert.equal(signUpSchema.safeParse(value).success, false);
  }
  assert.equal(signUpSchema.safeParse({ ...valid, password: "🙂".repeat(18) }).success, true);
});

test("el retorno de acceso permanece dentro del sitio", () => {
  for (const value of [null, "https://example.com", "//example.com", "/\\example.com", "javascript:alert(1)", "/\nexample.com"]) assert.equal(safeCallbackPath(value), "/");
  assert.equal(safeCallbackPath("/citas/nueva?paso=1"), "/citas/nueva?paso=1");
  assert.ok(publicPages.every((path) => !path.startsWith("/admin") && !path.startsWith("/citas")));
});

test("la publicación usa PostgreSQL sin cambiar el esquema local", () => {
  const sqlite = 'datasource db { provider = "sqlite" url = env("DATABASE_URL") }';
  assert.equal(schemaForDatabase(sqlite, "file:./dev.db"), sqlite);
  assert.equal(schemaForDatabase(sqlite, undefined), sqlite);
  assert.match(schemaForDatabase(sqlite, "postgres://user:password@example.com/db"), /provider = "postgresql"/);
  assert.throws(() => schemaForDatabase(sqlite, "mysql://example.com/db"));
});
