import fs from "node:fs";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

export const DATABASE_WRITES_ENABLED = false;

function sha256Hex(value) {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
}

export function normalizeHeader(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeHeaderKey(value) {
  return normalizeHeader(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function uniqueHeaders(values) {
  const seen = new Map();

  return values.map((value, index) => {
    let key =
      normalizeHeaderKey(value)
      || `column_${index + 1}`;

    const count =
      (seen.get(key) ?? 0) + 1;

    seen.set(key, count);

    if (count > 1) {
      key = `${key}_${count}`;
    }

    return key;
  });
}

const PY_XLSX = String.raw`
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

request = json.loads(sys.stdin.read())
path = request["filePath"]

NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
NS_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS_PKG = "http://schemas.openxmlformats.org/package/2006/relationships"

def tag_local(tag):
    return tag.rsplit("}", 1)[-1]

def col_index(cell_ref):
    m = re.match(r"([A-Z]+)", cell_ref or "")
    if not m:
        return 0
    value = 0
    for ch in m.group(1):
        value = value * 26 + (ord(ch) - 64)
    return value - 1

def text_nodes(node):
    values = []
    for el in node.iter():
        if tag_local(el.tag) == "t":
            values.append(el.text or "")
    return "".join(values)

with zipfile.ZipFile(path) as z:
    names = set(z.namelist())

    shared = []
    if "xl/sharedStrings.xml" in names:
        root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for si in root:
            if tag_local(si.tag) == "si":
                shared.append(text_nodes(si))

    workbook = ET.fromstring(z.read("xl/workbook.xml"))

    rel_map = {}
    if "xl/_rels/workbook.xml.rels" in names:
        rel_root = ET.fromstring(
            z.read("xl/_rels/workbook.xml.rels")
        )
        for rel in rel_root:
            rel_id = rel.attrib.get("Id")
            target = rel.attrib.get("Target")
            if rel_id and target:
                if target.startswith("/"):
                    full = target.lstrip("/")
                else:
                    full = "xl/" + target.lstrip("/")
                rel_map[rel_id] = full

    sheet_defs = []
    for el in workbook.iter():
        if tag_local(el.tag) != "sheet":
            continue
        name = el.attrib.get("name", "")
        rel_id = el.attrib.get(
            "{%s}id" % NS_REL
        )
        target = rel_map.get(rel_id)
        if target:
            sheet_defs.append((name, target))

    output = []

    for sheet_name, target in sheet_defs:
        if target not in names:
            continue

        root = ET.fromstring(z.read(target))
        rows = []

        for row in root.iter():
            if tag_local(row.tag) != "row":
                continue

            values = {}

            for cell in row:
                if tag_local(cell.tag) != "c":
                    continue

                ref = cell.attrib.get("r", "")
                idx = col_index(ref)
                cell_type = cell.attrib.get("t")

                value = None

                if cell_type == "inlineStr":
                    value = text_nodes(cell)
                else:
                    raw = None
                    for child in cell:
                        if tag_local(child.tag) == "v":
                            raw = child.text
                            break

                    if raw is not None:
                        if cell_type == "s":
                            try:
                                value = shared[int(raw)]
                            except Exception:
                                value = raw
                        elif cell_type == "b":
                            value = (raw == "1")
                        elif cell_type in ("str", "e"):
                            value = raw
                        else:
                            try:
                                number = float(raw)
                                if number.is_integer():
                                    number = int(number)
                                value = number
                            except Exception:
                                value = raw

                values[idx] = value

            if not values:
                continue

            max_idx = max(values)
            row_values = [
                values.get(i)
                for i in range(max_idx + 1)
            ]

            rows.append({
                "excelRowNumber":
                    int(row.attrib.get("r") or 0),
                "values":
                    row_values,
            })

        output.append({
            "sheetName":
                sheet_name,
            "rows":
                rows,
        })

print(json.dumps(output))
`;

function invokePythonXlsx(filePath) {
  const result = spawnSync(
    "python3",
    [
      "-c",
      PY_XLSX,
    ],
    {
      input:
        JSON.stringify({
          filePath,
        }),
      encoding:
        "utf8",
      maxBuffer:
        128 * 1024 * 1024,
    }
  );

  if (result.status !== 0) {
    throw new Error(
      [
        "XLSX parser failed:",
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

function nonEmptyCount(values) {
  return values.filter(
    value =>
      value !== null
      && value !== undefined
      && String(value).trim() !== ""
  ).length;
}

function chooseHeaderIndex(rows) {
  const limit =
    Math.min(
      rows.length,
      25
    );

  for (
    let index = 0;
    index < limit;
    index += 1
  ) {
    const row =
      rows[index]?.values ?? [];

    if (
      nonEmptyCount(row) >= 2
    ) {
      return index;
    }
  }

  return -1;
}

function rowObject(
  headers,
  values
) {
  const result = {};

  for (
    let i = 0;
    i < headers.length;
    i += 1
  ) {
    const value =
      i < values.length
        ? values[i]
        : null;

    result[
      headers[i]
    ] =
      value === undefined
        ? null
        : value;
  }

  return result;
}

function contentHash(value) {
  return sha256Hex(
    JSON.stringify(
      value,
      Object.keys(value).sort()
    )
  );
}

export function parseComparableWorkbook(
  filePath,
  {
    sourceDocumentId = null,
    sourceFamily =
      "COMPARABLE_TRANSACTIONS",
    sourcePath = null,
    sourceSha256 = null,
  } = {}
) {
  const workbook =
    invokePythonXlsx(
      filePath
    );

  const observations = [];

  let ordinal = 0;

  for (
    const sheet
    of workbook
  ) {
    const rows =
      sheet.rows ?? [];

    const headerIndex =
      chooseHeaderIndex(
        rows
      );

    if (
      headerIndex < 0
    ) {
      continue;
    }

    const headerRow =
      rows[
        headerIndex
      ];

    const headers =
      uniqueHeaders(
        headerRow.values ?? []
      );

    for (
      let i =
        headerIndex + 1;
      i < rows.length;
      i += 1
    ) {
      const row =
        rows[i];

      if (
        nonEmptyCount(
          row.values ?? []
        ) === 0
      ) {
        continue;
      }

      ordinal += 1;

      const fields =
        rowObject(
          headers,
          row.values ?? []
        );

      observations.push({
        sourceFamily,
        sourceDocumentId,
        sourcePath:
          sourcePath
          ?? filePath,
        sourceSha256,
        sourceSheet:
          sheet.sheetName,
        sourceRowNumber:
          row.excelRowNumber
          || i + 1,
        sourceRecordOrdinal:
          ordinal,
        observationKind:
          "COMPARABLE_ROW",
        fields,
        rawValues:
          row.values ?? [],
        observationContentSha256:
          contentHash(
            fields
          ),
      });
    }
  }

  return observations;
}

export function parseComparableFiles(
  documents
) {
  const result = [];

  for (
    const document
    of documents
  ) {
    result.push(
      ...parseComparableWorkbook(
        document.absolutePath,
        {
          sourceDocumentId:
            document.sourceDocumentId,
          sourceFamily:
            document.family
            ?? "COMPARABLE_TRANSACTIONS",
          sourcePath:
            document.relativePath
            ?? document.sourcePath
            ?? document.absolutePath,
          sourceSha256:
            document.sha256
            ?? document.sourceSha256
            ?? null,
        }
      )
    );
  }

  return result;
}
