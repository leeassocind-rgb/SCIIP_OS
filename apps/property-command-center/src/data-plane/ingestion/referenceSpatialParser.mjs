import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

export const DATABASE_WRITES_ENABLED = false;

function sha256Hex(value) {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
}

export function normalizeKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function parseCsvText(text) {
  const rows = [];

  let row = [];
  let field = "";
  let quoted = false;

  for (
    let i = 0;
    i < text.length;
    i += 1
  ) {
    const ch =
      text[i];

    if (quoted) {
      if (ch === '"') {
        if (
          text[i + 1]
          === '"'
        ) {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }

      continue;
    }

    if (ch === '"') {
      quoted = true;
      continue;
    }

    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (ch === "\n") {
      row.push(
        field.replace(
          /\r$/,
          ""
        )
      );

      rows.push(row);

      row = [];
      field = "";
      continue;
    }

    field += ch;
  }

  if (
    field.length > 0
    || row.length > 0
  ) {
    row.push(
      field.replace(
        /\r$/,
        ""
      )
    );

    rows.push(row);
  }

  return rows;
}

function uniqueHeaders(values) {
  const seen =
    new Map();

  return values.map(
    (value, index) => {
      let key =
        normalizeKey(value)
        || `column_${index + 1}`;

      const count =
        (seen.get(key) ?? 0)
        + 1;

      seen.set(
        key,
        count
      );

      if (
        count > 1
      ) {
        key =
          `${key}_${count}`;
      }

      return key;
    }
  );
}

function csvObservations(
  text,
  context
) {
  const rows =
    parseCsvText(
      text
    );

  if (
    rows.length === 0
  ) {
    return [];
  }

  let headerIndex = -1;

  for (
    let i = 0;
    i < Math.min(
      rows.length,
      25
    );
    i += 1
  ) {
    const count =
      rows[i].filter(
        value =>
          String(
            value ?? ""
          ).trim()
          !== ""
      ).length;

    if (
      count >= 2
    ) {
      headerIndex = i;
      break;
    }
  }

  if (
    headerIndex < 0
  ) {
    return [];
  }

  const headers =
    uniqueHeaders(
      rows[
        headerIndex
      ]
    );

  const result = [];

  let ordinal = 0;

  for (
    let i =
      headerIndex + 1;
    i < rows.length;
    i += 1
  ) {
    const values =
      rows[i];

    if (
      values.every(
        value =>
          String(
            value ?? ""
          ).trim()
          === ""
      )
    ) {
      continue;
    }

    ordinal += 1;

    const fields = {};

    for (
      let c = 0;
      c < headers.length;
      c += 1
    ) {
      fields[
        headers[c]
      ] =
        c < values.length
          ? values[c]
          : null;
    }

    result.push({
      ...context,
      observationKind:
        "REFERENCE_CSV_ROW",
      sourceRowNumber:
        i + 1,
      sourceRecordOrdinal:
        ordinal,
      fields,
    });
  }

  return result;
}

function xmlUnescape(value) {
  return String(
    value ?? ""
  )
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function extractTag(
  text,
  tag
) {
  const match =
    text.match(
      new RegExp(
        `<(?:\\w+:)?${tag}\\b[^>]*>([\\s\\S]*?)<\\/(?:\\w+:)?${tag}>`,
        "i"
      )
    );

  return match
    ? xmlUnescape(
        match[1]
          .replace(
            /<[^>]+>/g,
            ""
          )
          .trim()
      )
    : null;
}

function parseCoordinateText(
  value
) {
  if (!value) {
    return [];
  }

  return value
    .trim()
    .split(/\s+/)
    .map(token => {
      const [
        lon,
        lat,
        alt,
      ] =
        token
          .split(",")
          .map(Number);

      if (
        !Number.isFinite(lon)
        || !Number.isFinite(lat)
      ) {
        return null;
      }

      return (
        Number.isFinite(alt)
          ? [
              lon,
              lat,
              alt,
            ]
          : [
              lon,
              lat,
            ]
      );
    })
    .filter(Boolean);
}

function kmlObservations(
  text,
  context
) {
  const blocks =
    [
      ...text.matchAll(
        /<(?:\w+:)?Placemark\b[^>]*>([\s\S]*?)<\/(?:\w+:)?Placemark>/gi
      ),
    ];

  const result = [];

  let ordinal = 0;

  for (
    const match
    of blocks
  ) {
    ordinal += 1;

    const block =
      match[1];

    const name =
      extractTag(
        block,
        "name"
      );

    const coordinates =
      extractTag(
        block,
        "coordinates"
      );

    const coordinateList =
      parseCoordinateText(
        coordinates
      );

    let geometry = null;

    if (
      /<(?:\w+:)?Point\b/i
        .test(
          block
        )
      && coordinateList.length
      >= 1
    ) {
      geometry = {
        type:
          "Point",
        coordinates:
          coordinateList[0],
      };
    } else if (
      /<(?:\w+:)?LineString\b/i
        .test(
          block
        )
      && coordinateList.length
      >= 2
    ) {
      geometry = {
        type:
          "LineString",
        coordinates:
          coordinateList,
      };
    } else if (
      /<(?:\w+:)?Polygon\b/i
        .test(
          block
        )
      && coordinateList.length
      >= 4
    ) {
      geometry = {
        type:
          "Polygon",
        coordinates:[
          coordinateList,
        ],
      };
    }

    const extended = {};

    for (
      const dataMatch
      of block.matchAll(
        /<(?:\w+:)?Data\b[^>]*name=["']([^"']+)["'][^>]*>[\s\S]*?<(?:\w+:)?value\b[^>]*>([\s\S]*?)<\/(?:\w+:)?value>[\s\S]*?<\/(?:\w+:)?Data>/gi
      )
    ) {
      extended[
        normalizeKey(
          dataMatch[1]
        )
      ] =
        xmlUnescape(
          dataMatch[2]
            .replace(
              /<[^>]+>/g,
              ""
            )
            .trim()
        );
    }

    result.push({
      ...context,
      observationKind:
        "REFERENCE_KML_PLACEMARK",
      sourceRecordOrdinal:
        ordinal,
      name,
      fields:
        extended,
      geometry,
    });
  }

  return result;
}

function geoJsonObservations(
  value,
  context
) {
  const features =
    value?.type
    === "FeatureCollection"
      ? (
          value.features
          ?? []
        )
      : (
          value?.type
          === "Feature"
            ? [
                value,
              ]
            : []
        );

  return features.map(
    (feature, index) => ({
      ...context,
      observationKind:
        "REFERENCE_GEOJSON_FEATURE",
      sourceRecordOrdinal:
        index + 1,
      featureId:
        feature.id
        ?? null,
      fields:
        feature.properties
        ?? {},
      geometry:
        feature.geometry
        ?? null,
    })
  );
}

const PY_ZIP_TEXT = String.raw`
import base64
import json
import sys
import zipfile

request = json.loads(sys.stdin.read())
path = request["filePath"]

allowed = (
    ".csv",
    ".json",
    ".geojson",
    ".kml",
)

result = []

with zipfile.ZipFile(path) as z:
    for name in z.namelist():
        if name.endswith("/"):
            continue

        lower = name.lower()

        if not lower.endswith(allowed):
            continue

        data = z.read(name)

        if len(data) > 64 * 1024 * 1024:
            continue

        result.append({
            "name":
                name,
            "text":
                data.decode(
                    "utf-8",
                    errors="replace",
                ),
        })

print(json.dumps(result))
`;

function zipTextMembers(
  filePath
) {
  const result =
    spawnSync(
      "python3",
      [
        "-c",
        PY_ZIP_TEXT,
      ],
      {
        input:
          JSON.stringify({
            filePath,
          }),
        encoding:
          "utf8",
        maxBuffer:
          256 * 1024 * 1024,
      }
    );

  if (
    result.status
    !== 0
  ) {
    throw new Error(
      [
        "ZIP parser failed:",
        filePath,
        result.stdout ?? "",
        result.stderr ?? "",
      ].join("\n")
    );
  }

  return JSON.parse(
    result.stdout
  );
}

export function classifyReferenceSubtype(
  sourcePath,
  fields = {}
) {
  const text =
    [
      sourcePath,
      ...Object.keys(
        fields ?? {}
      ),
    ]
      .join(" ")
      .toLowerCase();

  if (
    /(?:^|[^a-z0-9])intermodal(?:[^a-z0-9]|$)/i
      .test(text)
  ) {
    return "INTERMODAL";
  }

  if (
    /\b(truck|traffic|aadt|volume)\b/i
      .test(text)
  ) {
    return "TRUCK_TRAFFIC";
  }

  if (
    /\b(lariac|aerial)\b/i
      .test(text)
  ) {
    return "LARIAC";
  }

  if (
    /\b(rail|railroad|bnsf|union.?pacific)\b/i
      .test(text)
  ) {
    return "RAIL";
  }

  if (
    /\b(boundar|market|submarket)\b/i
      .test(text)
  ) {
    return "BOUNDARY";
  }

  if (
    /\b(apn|parcel|assessor|property|owner)\b/i
      .test(text)
  ) {
    return "PROPERTY_SEARCH";
  }

  return "REFERENCE";
}

function decorateSubtype(
  observations
) {
  return observations.map(
    observation => ({
      ...observation,
      referenceSubtype:
        classifyReferenceSubtype(
          observation.sourcePath,
          observation.fields
        ),
    })
  );
}

export function parseReferenceFile(
  filePath,
  {
    sourceDocumentId = null,
    sourceFamily =
      "REFERENCE_AND_SPATIAL",
    sourcePath = null,
    sourceSha256 = null,
    pdftotext = null,
  } = {}
) {
  const effectivePath =
    sourcePath
    ?? filePath;

  const context = {
    sourceFamily,
    sourceDocumentId,
    sourcePath:
      effectivePath,
    sourceSha256,
  };

  const ext =
    path
      .extname(
        filePath
      )
      .toLowerCase();

  if (
    ext === ".csv"
  ) {
    return decorateSubtype(
      csvObservations(
        fs.readFileSync(
          filePath,
          "utf8"
        ),
        context
      )
    );
  }

  if (
    ext === ".geojson"
    || ext === ".json"
  ) {
    return decorateSubtype(
      geoJsonObservations(
        JSON.parse(
          fs.readFileSync(
            filePath,
            "utf8"
          )
        ),
        context
      )
    );
  }

  if (
    ext === ".kml"
  ) {
    return decorateSubtype(
      kmlObservations(
        fs.readFileSync(
          filePath,
          "utf8"
        ),
        context
      )
    );
  }

  if (
    ext === ".zip"
    || ext === ".kmz"
  ) {
    const output = [];

    for (
      const member
      of zipTextMembers(
        filePath
      )
    ) {
      const memberContext = {
        ...context,
        sourceArchiveMember:
          member.name,
      };

      const memberExt =
        path
          .extname(
            member.name
          )
          .toLowerCase();

      let parsed = [];

      if (
        memberExt === ".csv"
      ) {
        parsed =
          csvObservations(
            member.text,
            memberContext
          );
      } else if (
        memberExt === ".kml"
      ) {
        parsed =
          kmlObservations(
            member.text,
            memberContext
          );
      } else if (
        memberExt
          === ".json"
        || memberExt
          === ".geojson"
      ) {
        try {
          parsed =
            geoJsonObservations(
              JSON.parse(
                member.text
              ),
              memberContext
            );
        } catch {
          parsed = [];
        }
      }

      output.push(
        ...parsed
      );
    }

    return decorateSubtype(
      output
    );
  }

  if (
    ext === ".pdf"
    && pdftotext
  ) {
    const process =
      spawnSync(
        pdftotext,
        [
          "-layout",
          filePath,
          "-",
        ],
        {
          encoding:
            "utf8",
          maxBuffer:
            128 * 1024 * 1024,
        }
      );

    if (
      process.status
      !== 0
    ) {
      throw new Error(
        process.stderr
        || "pdftotext failed"
      );
    }

    const pages =
      String(
        process.stdout
        ?? ""
      )
        .split("\f")
        .filter(
          page =>
            page.trim()
            !== ""
        );

    return decorateSubtype(
      pages.map(
        (pageText, index) => ({
          ...context,
          observationKind:
            "REFERENCE_PDF_PAGE",
          sourceRecordOrdinal:
            index + 1,
          pageNumber:
            index + 1,
          fields:{},
          text:
            pageText,
        })
      )
    );
  }

  return [];
}

export function parseReferenceFiles(
  documents,
  {
    pdftotext = null,
  } = {}
) {
  const output = [];

  for (
    const document
    of documents
  ) {
    output.push(
      ...parseReferenceFile(
        document.absolutePath,
        {
          sourceDocumentId:
            document.sourceDocumentId,
          sourceFamily:
            document.family
            ?? "REFERENCE_AND_SPATIAL",
          sourcePath:
            document.relativePath
            ?? document.sourcePath
            ?? document.absolutePath,
          sourceSha256:
            document.sha256
            ?? document.sourceSha256
            ?? null,
          pdftotext,
        }
      )
    );
  }

  return output;
}

export function observationDigest(
  observation
) {
  return sha256Hex(
    JSON.stringify(
      observation
    )
  );
}
