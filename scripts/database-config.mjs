export function schemaForDatabase(schema, databaseUrl) {
  if (!databaseUrl || databaseUrl.startsWith("file:")) return schema;
  if (!/^postgres(?:ql)?:\/\//.test(databaseUrl)) throw new Error("Se requiere una conexión PostgreSQL directa para producción.");
  return schema.replace('provider = "sqlite"', 'provider = "postgresql"');
}
