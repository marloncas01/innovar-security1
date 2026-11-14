import test from "node:test";
import assert from "node:assert/strict";
import { initialQuoteService, quoteRequestSchema, quoteRequestText } from "../src/lib/quote-request";

const request = { space: "Negocio", service: "Mantenimiento o reparación", areas: ["Entradas y accesos"], quantity: "Por definir", municipality: "  Fómeque  ", notes: "  Revisar cámaras existentes  " };
test("la solicitud normaliza detalles y exige municipio y zonas válidas",()=>{
  const parsed=quoteRequestSchema.parse(request);
  assert.equal(parsed.municipality,"Fómeque");
  assert.equal(parsed.notes,"Revisar cámaras existentes");
  for(const override of [{municipality:"  "},{areas:[]},{areas:["zona inventada"]},{notes:"a".repeat(801)},{quantity:-1}]) assert.equal(quoteRequestSchema.safeParse({...request,...override}).success,false);
});
test("el resumen conserva las necesidades y aclara que no es una cotización ni una reserva",()=>{
  const text=quoteRequestText(quoteRequestSchema.parse(request));
  assert.ok(text.includes("Municipio: Fómeque"));
  assert.ok(text.includes("Revisar cámaras existentes"));
  assert.ok(text.includes("No es una cotización definitiva, una compra ni una cita confirmada"));
  assert.ok(text.includes("impuestos y desplazamiento"));
  assert.equal(initialQuoteService("mantenimiento"),"Mantenimiento o reparación");
  assert.equal(initialQuoteService("https://otro.example"),"Visita técnica y asesoría");
});
