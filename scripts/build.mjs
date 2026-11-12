import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { schemaForDatabase } from "./database-config.mjs";

const require = createRequire(import.meta.url);
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (databaseUrl) process.env.DATABASE_URL = databaseUrl;
const schemaPath = "prisma/schema.build.prisma";
const source = await readFile("prisma/schema.prisma", "utf8");
await writeFile(schemaPath, schemaForDatabase(source, databaseUrl));

function run(modulePath, args) {
  const result = spawnSync(process.execPath, [require.resolve(modulePath), ...args], { stdio: "inherit", env: process.env });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}

run("prisma/build/index.js", ["generate", "--schema", schemaPath]);
if (process.env.VERCEL === "1" && /^postgres(?:ql)?:\/\//.test(databaseUrl || "")) {
  // Refuse schema updates that Prisma considers destructive.
  run("prisma/build/index.js", ["db", "push", "--schema", schemaPath, "--skip-generate"]);
  run("tsx/cli", ["prisma/seed-production.ts"]);
}
run("next/dist/bin/next", ["build"]);
