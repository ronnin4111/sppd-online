import { createClient, type Client, type InValue } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

let client: Client | undefined;

export function getClient(): Client {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) {
    throw new Error("TURSO_DATABASE_URL belum dikonfigurasi.");
  }

  client = createClient({ url, authToken });
  return client;
}

export function getDb() {
  return drizzle(getClient(), { schema });
}

type Row = Record<string, unknown>;

export type PreparedStatement = {
  bind: (...values: unknown[]) => PreparedStatement;
  run: () => Promise<unknown>;
  first: <T = Row>() => Promise<T | null>;
  all: <T = Row>() => Promise<{ results: T[] }>;
  statement: () => { sql: string; args: InValue[] };
};

export type DatabaseAdapter = {
  prepare: (sql: string) => PreparedStatement;
  batch: (statements: PreparedStatement[]) => Promise<unknown>;
};

function asInput(value: unknown): InValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint" ||
    value instanceof ArrayBuffer ||
    value instanceof Uint8Array
  ) {
    return value;
  }
  if (typeof value === "boolean") return value ? 1 : 0;
  return String(value);
}

export function getDatabaseAdapter(): DatabaseAdapter {
  const turso = getClient();
  const prepare = (sql: string): PreparedStatement => {
    let args: InValue[] = [];
    const statement: PreparedStatement = {
      bind: (...values) => {
        args = values.map(asInput);
        return statement;
      },
      run: async () => turso.execute({ sql, args }),
      first: async <T = Row>() => {
        const result = await turso.execute({ sql, args });
        return (result.rows[0] as T | undefined) ?? null;
      },
      all: async <T = Row>() => {
        const result = await turso.execute({ sql, args });
        return { results: result.rows as unknown as T[] };
      },
      statement: () => ({ sql, args }),
    };
    return statement;
  };

  return {
    prepare,
    batch: (statements) => turso.batch(statements.map((item) => item.statement()), "write"),
  };
}
