-- SCIIP R140 GOVERNED DATA PLANE
-- PostgreSQL/PostGIS definition only.
-- R140 DOES NOT EXECUTE THIS FILE.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE source_document (
  source_document_id text PRIMARY KEY,
  source_system text NOT NULL,
  source_kind text NOT NULL,
  effective_date date,
  original_name text NOT NULL,
  content_sha256 char(64) NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE source_observation (
  source_observation_id text PRIMARY KEY,
  source_document_id text NOT NULL
    REFERENCES source_document(source_document_id),
  record_locator text NOT NULL,
  observed_object_type text NOT NULL,
  effective_date date,
  source_key text,
  raw_record jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE asset (
  asset_id text PRIMARY KEY,
  canonical_name text,
  asset_status text NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE address (
  address_id text PRIMARY KEY,
  address_line1 text,
  city text,
  state text,
  zip5 text,
  normalized_key text,
  geom geometry(Point,4326)
);

CREATE TABLE building (
  building_id text PRIMARY KEY,
  asset_id text REFERENCES asset(asset_id),
  address_id text REFERENCES address(address_id),
  building_sf numeric,
  year_built integer,
  clear_height_text text,
  amps numeric,
  zoning text,
  CHECK (building_sf IS NULL OR building_sf >= 0)
);

CREATE TABLE parcel (
  parcel_id text PRIMARY KEY,
  apn_normalized text UNIQUE,
  geom geometry(MultiPolygon,4326)
);

CREATE TABLE asset_parcel_edge (
  asset_id text NOT NULL REFERENCES asset(asset_id),
  parcel_id text NOT NULL REFERENCES parcel(parcel_id),
  relationship_type text NOT NULL,
  source_observation_id text
    REFERENCES source_observation(source_observation_id),
  PRIMARY KEY (
    asset_id,
    parcel_id,
    relationship_type,
    source_observation_id
  )
);

CREATE TABLE space (
  space_id text PRIMARY KEY,
  building_id text NOT NULL REFERENCES building(building_id),
  parent_space_id text REFERENCES space(space_id),
  label text,
  physical_sf numeric,
  CHECK (physical_sf IS NULL OR physical_sf >= 0)
);

CREATE TABLE listing (
  listing_id text PRIMARY KEY,
  asset_id text REFERENCES asset(asset_id),
  listing_number text,
  offer_type text,
  source_system text NOT NULL,
  UNIQUE(source_system,listing_number)
);

CREATE TABLE listing_configuration (
  listing_configuration_id text PRIMARY KEY,
  listing_id text NOT NULL REFERENCES listing(listing_id),
  label text,
  marketed_sf numeric,
  source_observation_id text
    REFERENCES source_observation(source_observation_id),
  CHECK (marketed_sf IS NULL OR marketed_sf >= 0)
);

CREATE TABLE listing_configuration_space (
  listing_configuration_id text NOT NULL
    REFERENCES listing_configuration(listing_configuration_id),
  space_id text NOT NULL REFERENCES space(space_id),
  PRIMARY KEY (listing_configuration_id,space_id)
);

CREATE TABLE event_registry (
  event_id text PRIMARY KEY,
  listing_id text REFERENCES listing(listing_id),
  asset_id text REFERENCES asset(asset_id),
  event_type text NOT NULL,
  effective_date date,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE event_observation_edge (
  event_id text NOT NULL REFERENCES event_registry(event_id),
  source_observation_id text NOT NULL
    REFERENCES source_observation(source_observation_id),
  PRIMARY KEY (event_id,source_observation_id)
);

CREATE TABLE listing_state (
  listing_id text PRIMARY KEY REFERENCES listing(listing_id),
  status text NOT NULL,
  rate jsonb,
  price numeric,
  marketed_sf numeric,
  unique_available_sf numeric,
  vacant_sf numeric,
  vacant boolean,
  possession text,
  overlap_status text,
  last_event_id text REFERENCES event_registry(event_id),
  last_event_date date,
  CHECK (marketed_sf IS NULL OR marketed_sf >= 0),
  CHECK (
    unique_available_sf IS NULL OR
    unique_available_sf >= 0
  ),
  CHECK (vacant_sf IS NULL OR vacant_sf >= 0)
);

CREATE TABLE transaction_history (
  transaction_id text PRIMARY KEY,
  asset_id text REFERENCES asset(asset_id),
  transaction_type text NOT NULL,
  transaction_date date,
  comp_sf numeric,
  rate jsonb,
  price numeric,
  parties jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_observation_id text
    REFERENCES source_observation(source_observation_id)
);

CREATE TABLE geography (
  geography_id text PRIMARY KEY,
  geography_type text NOT NULL,
  name text NOT NULL,
  parent_geography_id text REFERENCES geography(geography_id),
  authority_source text NOT NULL,
  geom geometry(MultiPolygon,4326)
);

CREATE TABLE asset_geography (
  asset_id text NOT NULL REFERENCES asset(asset_id),
  geography_id text NOT NULL REFERENCES geography(geography_id),
  assignment_method text NOT NULL,
  source_observation_id text
    REFERENCES source_observation(source_observation_id),
  PRIMARY KEY(asset_id,geography_id)
);

CREATE TABLE spatial_feature (
  spatial_feature_id text PRIMARY KEY,
  feature_type text NOT NULL,
  name text,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  geom geometry(Geometry,4326) NOT NULL,
  source_document_id text
    REFERENCES source_document(source_document_id)
);

CREATE TABLE identity_crosswalk (
  identity_crosswalk_id text PRIMARY KEY,
  object_type text NOT NULL,
  canonical_id text NOT NULL,
  source_system text NOT NULL,
  source_key text NOT NULL,
  confidence text NOT NULL,
  source_observation_id text
    REFERENCES source_observation(source_observation_id),
  UNIQUE(object_type,source_system,source_key)
);

CREATE INDEX address_geom_gix
  ON address USING gist(geom);

CREATE INDEX parcel_geom_gix
  ON parcel USING gist(geom);

CREATE INDEX geography_geom_gix
  ON geography USING gist(geom);

CREATE INDEX spatial_feature_geom_gix
  ON spatial_feature USING gist(geom);
