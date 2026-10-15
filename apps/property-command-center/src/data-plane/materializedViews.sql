-- SCIIP R140 analytical definitions only.
-- R140 DOES NOT EXECUTE THIS FILE.

CREATE MATERIALIZED VIEW mv_current_listing_state AS
SELECT
  l.listing_id,
  l.asset_id,
  l.listing_number,
  l.offer_type,
  s.status,
  s.rate,
  s.price,
  s.marketed_sf,
  s.unique_available_sf,
  s.vacant_sf,
  s.vacant,
  s.possession,
  s.overlap_status,
  s.last_event_date
FROM listing l
LEFT JOIN listing_state s
  ON s.listing_id=l.listing_id;

CREATE MATERIALIZED VIEW mv_asset_current_availability AS
SELECT
  a.asset_id,
  COUNT(*) FILTER (
    WHERE m.status='AVAILABLE'
  ) AS available_listing_count,

  SUM(m.marketed_sf) FILTER (
    WHERE m.status='AVAILABLE'
  ) AS marketed_configuration_sf_sum,

  CASE
    WHEN BOOL_OR(
      m.status='AVAILABLE'
      AND m.unique_available_sf IS NULL
    )
    THEN NULL

    ELSE SUM(m.unique_available_sf) FILTER (
      WHERE m.status='AVAILABLE'
    )
  END AS deterministically_resolved_unique_available_sf,

  CASE
    WHEN BOOL_OR(
      m.status='AVAILABLE'
      AND m.vacant_sf IS NULL
    )
    THEN NULL

    ELSE SUM(m.vacant_sf) FILTER (
      WHERE m.status='AVAILABLE'
    )
  END AS deterministically_resolved_vacant_sf

FROM asset a
LEFT JOIN mv_current_listing_state m
  ON m.asset_id=a.asset_id
GROUP BY a.asset_id;
