import pg from "pg";

const { Pool } = pg;

const ALLOWED_TABLES = Object.freeze({
  assets: "asset",
  buildings: "building",
  listings: "listing",
});

function asInteger(value, fallback, { min = 0, max = 500 } = {}) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export class PostgresReadRepository {
  constructor({
    database = process.env.SCIIP_PG_DATABASE || process.env.PGDATABASE || "sciip_local_r148",
    host = process.env.SCIIP_PG_HOST || process.env.PGHOST,
    port = Number(process.env.SCIIP_PG_PORT || process.env.PGPORT || 5432),
    user = process.env.SCIIP_PG_USER || process.env.PGUSER,
    password = process.env.SCIIP_PG_PASSWORD || process.env.PGPASSWORD,
  } = {}) {
    this.pool = new Pool({
      database,
      host,
      port,
      user,
      password,
      max: 4,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
      application_name: "sciip-property-command-center-read",
    });
    this.database = database;
  }

  async #readOnly(callback) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN READ ONLY");
      const value = await callback(client);
      await client.query("ROLLBACK");
      return value;
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch {}
      throw error;
    } finally {
      client.release();
    }
  }

  async health() {
    return this.#readOnly(async (client) => {
      const result = await client.query(`
        SELECT
          (SELECT count(*)::int FROM asset) AS assets,
          (SELECT count(*)::int FROM building) AS buildings,
          (SELECT count(*)::int FROM listing) AS listings,
          current_database() AS database
      `);
      return result.rows[0];
    });
  }

  async list(kind, { limit = 100, offset = 0 } = {}) {
    const table = ALLOWED_TABLES[kind];
    if (!table) throw new Error(`Unsupported read collection: ${kind}`);

    const safeLimit = asInteger(limit, 100, { min: 1, max: 500 });
    const safeOffset = asInteger(offset, 0, { min: 0, max: 1_000_000 });

    return this.#readOnly(async (client) => {
      const result = await client.query(
        `SELECT to_jsonb(t) AS row
           FROM public.${table} AS t
          ORDER BY 1
          LIMIT $1 OFFSET $2`,
        [safeLimit, safeOffset],
      );
      return {
        source: "postgres",
        collection: kind,
        table,
        limit: safeLimit,
        offset: safeOffset,
        rows: result.rows.map(({ row }) => row),
      };
    });
  }

  async close() {
    await this.pool.end();
  }
}

export function createPostgresReadRepository(options) {
  return new PostgresReadRepository(options);
}
