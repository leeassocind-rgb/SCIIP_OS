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


  // SCIIP_A10BA_EXPLORER_PROPERTY_PROJECTION_V2
  async explorerProperties({ limit = 10_000, offset = 0 } = {}) {
    const safeLimit = asInteger(limit, 10_000, { min: 1, max: 10_000 });
    const safeOffset = asInteger(offset, 0, { min: 0, max: 1_000_000 });

    return this.#readOnly(async (client) => {
      const result = await client.query(`
        WITH asset_obs AS (
          SELECT DISTINCT ON (ag.asset_id)
                 ag.asset_id,
                 so.source_observation_id,
                 so.observed_object_type,
                 so.effective_date,
                 so.raw_record::jsonb AS raw_record
            FROM asset_geography ag
            JOIN source_observation so
              ON so.source_observation_id = ag.source_observation_id
           WHERE ag.asset_id IS NOT NULL
             AND ag.source_observation_id IS NOT NULL
           ORDER BY ag.asset_id,
                    CASE WHEN so.observed_object_type = 'AIR_BASE_INVENTORY_OBSERVATION' THEN 0 ELSE 1 END,
                    so.effective_date DESC NULLS LAST,
                    so.source_observation_id
        ),
        first_building AS (
          SELECT DISTINCT ON (b.asset_id)
                 b.*
            FROM building b
           WHERE b.asset_id IS NOT NULL
           ORDER BY b.asset_id, b.building_id
        ),
        first_geo AS (
          SELECT DISTINCT ON (ag.asset_id)
                 ag.asset_id,
                 gr.name AS geography_name,
                 gr.geography_type
            FROM asset_geography ag
            JOIN geography_registry gr
              ON gr.geography_id = ag.geography_id
           ORDER BY ag.asset_id, gr.name NULLS LAST, gr.geography_id
        )
        SELECT
          a.asset_id::text AS id,
          COALESCE(
            NULLIF(a.canonical_name, ''),
            NULLIF(ao.raw_record->>'propertyName', ''),
            NULLIF(ao.raw_record->>'name', ''),
            NULLIF(ad.address_line1, ''),
            NULLIF(ao.raw_record->>'address', '')
          ) AS "canonicalName",
          COALESCE(
            NULLIF(ad.address_line1, ''),
            NULLIF(ao.raw_record->>'address', '')
          ) AS address,
          NULL::text AS city,
          NULL::text AS state,
          NULL::text AS "regionCode",
          COALESCE(
            NULLIF(ad.zip5, ''),
            NULLIF(ao.raw_record->>'zip', ''),
            NULLIF(ao.raw_record->>'postalCode', '')
          ) AS zip,
          COALESCE(
            NULLIF(ad.zip5, ''),
            NULLIF(ao.raw_record->>'zip', ''),
            NULLIF(ao.raw_record->>'postalCode', '')
          ) AS "postalCode",
          COALESCE(
            fb.building_sf,
            CASE
              WHEN (ao.raw_record->>'buildingSf') ~ '^[0-9]+([.][0-9]+)?$'
              THEN (ao.raw_record->>'buildingSf')::numeric
              ELSE NULL
            END
          ) AS "buildingSf",
          COALESCE(
            fb.year_built,
            CASE
              WHEN (ao.raw_record->>'yearBuilt') ~ '^[0-9]{4}$'
              THEN (ao.raw_record->>'yearBuilt')::integer
              ELSE NULL
            END
          ) AS "yearBuilt",
          COALESCE(
            NULLIF(fb.clear_height_text, ''),
            NULLIF(ao.raw_record->>'clearHeightMaxFt', ''),
            NULLIF(ao.raw_record->>'clearHeightMinFt', '')
          ) AS "clearHeight",
          COALESCE(
            fb.amps,
            CASE
              WHEN (ao.raw_record->>'amps') ~ '^[0-9]+([.][0-9]+)?$'
              THEN (ao.raw_record->>'amps')::numeric
              ELSE NULL
            END
          ) AS amps,
          COALESCE(
            NULLIF(fb.zoning, ''),
            NULLIF(ao.raw_record->>'zoning', '')
          ) AS zoning,
          COALESCE(
            NULLIF(a.asset_status, ''),
            NULLIF(ao.raw_record->>'buildingStatus', '')
          ) AS status,
          COALESCE(
            NULLIF(fg.geography_name, ''),
            NULLIF(ao.raw_record->>'submarket', '')
          ) AS submarket,
          fg.geography_type AS "geographyType",
          COALESCE(
            NULLIF(ao.raw_record->>'trueOwnerCompany', ''),
            NULLIF(ao.raw_record->>'legalOwnerCompany', '')
          ) AS owner,
          CASE
            WHEN (ao.raw_record->>'totalAvailableSpace') ~ '^[0-9]+([.][0-9]+)?$'
            THEN (ao.raw_record->>'totalAvailableSpace')::numeric
            WHEN (ao.raw_record->>'availableSf') ~ '^[0-9]+([.][0-9]+)?$'
            THEN (ao.raw_record->>'availableSf')::numeric
            ELSE NULL
          END AS "availableSf",
          ao.observed_object_type AS "observationType",
          ao.source_observation_id::text AS "sourceObservationId"
        FROM asset a
        LEFT JOIN first_building fb ON fb.asset_id = a.asset_id
        LEFT JOIN address ad ON ad.address_id = fb.address_id
        LEFT JOIN asset_obs ao ON ao.asset_id = a.asset_id
        LEFT JOIN first_geo fg ON fg.asset_id = a.asset_id
        ORDER BY a.asset_id
        LIMIT $1 OFFSET $2
      `, [safeLimit, safeOffset]);

      return {
        source: "postgres",
        collection: "properties",
        projection: "R154-A10AZ",
        limit: safeLimit,
        offset: safeOffset,
        rows: result.rows,
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
