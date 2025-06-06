import { DEFAULT_KINTO_SERVER, SINGLE_SERVER } from "@src/constants";
import type {
  Capabilities,
  HistoryFilters,
  RecordData,
  ResourceHistoryEntry,
  ServerEntry,
} from "@src/types";
import { diffJson as diff } from "diff";
import React from "react";
import { format } from "timeago.js";

export function clone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export function omit(obj: any, keys: string[] = []): any {
  return Object.keys(obj).reduce((acc: any, key: string) => {
    return keys.includes(key) ? acc : { ...acc, [key]: obj[key] };
  }, {});
}

export function isObject(thing: any): boolean {
  return typeof thing === "object" && thing !== null && !Array.isArray(thing);
}

export function timeago(timestamp: number, now?: number | null): string {
  // Show relative time according to current timezone. The now value is used
  // for testing.
  const nowUTC = now || new Date().getTime();
  // In our use case, we should never show relative time in the future.
  // For example, if local computer is late, the server timestamp will appear
  // to be in the future. Hence use "now" as a maximum.
  return format(new Date(Math.min(timestamp, nowUTC)), undefined, {
    relativeDate: new Date(nowUTC),
  });
}

export function capitalize(str: string): string {
  return str.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
}

export function validJSON(string: string): boolean {
  try {
    JSON.parse(string);
    return true;
  } catch (_err) {
    return false;
  }
}

export function validateSchema(jsonSchema: string) {
  let schema: any;
  try {
    schema = JSON.parse(jsonSchema);
  } catch (_err) {
    throw "The schema is not valid JSON";
  }
  const checks: Array<{ test: () => boolean; error: string }> = [
    {
      test: () => isObject(schema),
      error: "The schema is not an object",
    },
    {
      test: () => Object.prototype.hasOwnProperty.call(schema, "type"),
      error: "The schema has no type",
    },
    {
      test: () => schema.type === "object",
      error: "The schema type is not 'object'",
    },
    {
      test: () => Object.prototype.hasOwnProperty.call(schema, "properties"),
      error: "The schema has no 'properties' property",
    },
    {
      test: () => isObject(schema.properties),
      error: "The 'properties' property is not an object",
    },
    {
      test: () => Object.keys(schema.properties).length > 0,
      error: "The 'properties' property object has no properties",
    },
  ];
  checks.forEach(({ test, error }) => {
    if (!test()) {
      throw error;
    }
  });
  return schema;
}

export function validateUiSchema(jsonUiSchema: string, jsonSchema: string) {
  let uiSchema: any,
    schema: any = JSON.parse(jsonSchema);
  try {
    uiSchema = JSON.parse(jsonUiSchema);
  } catch (_err) {
    throw "The uiSchema is not valid JSON";
  }
  const hasOrder: boolean = Object.prototype.hasOwnProperty.call(
    uiSchema,
    "ui:order"
  );
  let checks: Array<{ test: () => boolean; error: string }> = [
    {
      test: () => isObject(uiSchema),
      error: "The uiSchema is not an object",
    },
  ];
  if (hasOrder) {
    const order = uiSchema["ui:order"];
    const properties: string[] = Object.keys(schema.properties);
    const arrayId = (array: string[]): string =>
      array.slice().sort().toString();
    checks = checks.concat([
      {
        test: () => Array.isArray(order),
        error: "The uiSchema ui:order directive isn't an array",
      },
      {
        test: () => arrayId(order) === arrayId(properties),
        error: "The ui:order directive should list all schema properties",
      },
    ]);
  }
  checks.forEach(({ test, error }) => {
    if (!test()) {
      throw error;
    }
  });
  return uiSchema;
}

export function cleanRecord(record: RecordData): RecordData {
  return omit(record, ["id", "schema", "last_modified", "attachment"]);
}

function handleNestedDisplayField(
  record: RecordData,
  displayField: string
): any {
  const fields = displayField.split(".");

  // If the first part matches, we try to render its value.
  if (Object.prototype.hasOwnProperty.call(record, fields[0])) {
    return renderDisplayField(record[fields[0]], fields.slice(1).join("."));
  }

  // In case we have properties containing dots,
  // we look for other candidates in the record attributes.
  let biggestCandidate = [];
  let candidates = Object.keys(record).filter(key => {
    return key.indexOf(fields[0] + ".") === 0;
  });

  // For all the properties candidates
  for (const key of candidates) {
    let nextCandidate = [];
    // For all parts of the displayField
    for (const part of fields) {
      // If the candidate matches the key we try a longer one.
      let candidate = nextCandidate.concat([part]).join(".");
      if (key.indexOf(candidate) !== -1) {
        nextCandidate.push(part);
      }
    }
    // If the new candidate is bigger than the previous one we keep it.
    if (nextCandidate.length > biggestCandidate.length) {
      biggestCandidate = nextCandidate;
    }
  }

  if (biggestCandidate.length > 0) {
    // If we found a property matching we try to render its value.
    const key = biggestCandidate.join(".");
    return renderDisplayField(
      record[key],
      fields.slice(biggestCandidate.length).join(".")
    );
  }
  return "<unknown>";
}

export function linkify(string: string): any {
  if (/https?:\/\//.test(string)) {
    return (
      <a href={string} title={string} target="_blank">
        {string}
      </a>
    );
  }
  return string;
}

export function renderDisplayField(record: object, displayField: string): any {
  if (!record) {
    return "<unknown>";
  }
  if (Object.prototype.hasOwnProperty.call(record, displayField)) {
    const field = record[displayField];
    if (typeof field === "string") {
      return linkify(field);
    } else if (
      Array.isArray(field) &&
      field.every(x => typeof x === "string")
    ) {
      return field.join(", ");
    } else if (typeof field === "object") {
      return JSON.stringify(field);
    } else {
      return String(field);
    }
  } else if (displayField === "__json") {
    return <code>{JSON.stringify(cleanRecord(record))}</code>;
  } else if (displayField.indexOf(".") !== -1) {
    return handleNestedDisplayField(record, displayField);
  }
  return "<unknown>";
}

export function humanDate(since: string | number): string {
  return (
    new Date(
      typeof since === "string" ? parseInt(since, 10) : since
    ).toLocaleDateString("en-US", {
      timeZone: "UTC",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }) + " UTC"
  );
}

export function buildAttachmentUrl(
  record: RecordData,
  capabilities: Capabilities
): string | undefined {
  if (
    record.attachment == null ||
    capabilities.attachments == null ||
    !Object.prototype.hasOwnProperty.call(record.attachment, "location")
  ) {
    return;
  }
  const { base_url = "" } = capabilities.attachments;
  const { location } = record.attachment;
  const ensureTrailingSlash = str => (str.endsWith("/") ? str : str + "/");
  const dropStartingSlash = str => (str.startsWith("/") ? str.slice(1) : str);
  return location.startsWith(base_url)
    ? location
    : ensureTrailingSlash(base_url) + dropStartingSlash(location);
}

export function scrollToTop(): Promise<void> {
  window.scrollTo(0, 0);
  return Promise.resolve();
}

export function sortHistoryEntryPermissions(
  entry: ResourceHistoryEntry
): ResourceHistoryEntry {
  const { permissions } = entry.target;
  if (!permissions) {
    return entry;
  }
  return {
    ...entry,
    target: {
      ...entry.target,
      permissions: Object.keys(permissions).reduce(
        (acc, type) => ({ ...acc, [type]: permissions[type].sort() }),
        {}
      ),
    },
  };
}

export function debounce(fn: any, delay: number) {
  var timer = null;
  return (...args: any) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function getServerByPriority(servers: ServerEntry[] | null | undefined) {
  // Return the server URL value, by priority:
  // - single server mode
  // - most recently used
  // - default
  return SINGLE_SERVER || servers?.[0]?.server || DEFAULT_KINTO_SERVER;
}

export function isObjectEmpty(obj: object) {
  return Object.keys(obj).length === 0;
}

export const getAuthLabel = (authType: string) => {
  const labels = {
    anonymous: "Anonymous",
    basicauth: "Basic Auth",
    accounts: "Kinto Account Auth",
    fxa: "Firefox Account",
    ldap: "LDAP",
    portier: "Portier",
  };
  if (authType.startsWith("openid-")) {
    // The authType openid-<provider> is constructed in getSupportedAuthMethods.
    const provider = authType.replace("openid-", "");
    const prettyProvider =
      labels[provider] || provider.charAt(0).toUpperCase() + provider.slice(1);
    return `OpenID Connect (${prettyProvider})`;
  }
  return labels[authType];
};

export function parseHistoryFilters(params: URLSearchParams): HistoryFilters {
  const ret: HistoryFilters = {};
  const since = params.get("since");
  if (since) {
    ret.since = since;
  }
  const resourceName = params.get("resource_name");
  if (resourceName) {
    ret.resource_name = resourceName;
  }
  const excludeUserId = params.get("exclude_user_id");
  if (excludeUserId) {
    ret.exclude_user_id = excludeUserId;
  }
  return ret;
}

/**
 * Copy specified string to OS clipboard.
 */
export async function copyToClipboard(s: string | null | undefined) {
  let state;
  try {
    ({ state } = await navigator.permissions.query({
      name: "clipboard-write",
    } as any));
  } catch (e) {
    console.error(e);
    // XXX See https://bugzilla.mozilla.org/show_bug.cgi?id=1560373
    state = "firefox";
  }
  if (["granted", "prompt", "firefox"].includes(state)) {
    await navigator.clipboard.writeText(s || "");
  }
}

export function diffJson(
  a: object,
  b: object,
  // Number of lines to show above/below changes in diffs.
  nLines: number | "all" = 3
): string[] {
  const chunks = diff(a, b);
  return chunks.map((chunk, i) => {
    const isFirstChunk = i == 0;
    const isLastChunk = i == chunks.length - 1;

    // Remove empty lines.
    let lines = chunk.value.split("\n").filter(part => part !== "");

    const context: number = nLines === "all" ? lines.length : nLines;

    if (!chunk.added && !chunk.removed) {
      // Truncate beginning of first chunk if larger than context.
      // The opening brace "{" does not count as context, hence +1.
      if (isFirstChunk && lines.length > context + 1) {
        lines = ["..."].concat(lines.slice(-context));
        // Truncate end of last chunk if larger than context.
        // The closing brace "}" does not count as context, hence +1.
      } else if (isLastChunk && lines.length > context + 1) {
        lines = lines.slice(0, context).concat(["..."]);
        // Truncate middle chunk only if larger than twice the context (above + below).
      } else if (lines.length > context * 2) {
        lines = lines
          .slice(0, context)
          .concat(["..."])
          .concat(lines.slice(-context));
      }
    }

    // Prefix chunk lines with sign.
    const prefixedChunk = lines
      .map(line => {
        const prefix = chunk.added ? "+ " : chunk.removed ? "- " : "  ";
        return prefix + line;
      })
      .join("\n");
    return prefixedChunk;
  });
}

// Allows us to share or expose data between components outside of poviders.
// We could also use a context provider, but that could cause confusion
// while redux is still in place.
export function makeObservable(target) {
  let listeners = [];
  let value = target;

  function get() {
    return value;
  }

  function set(newValue) {
    if (value === newValue) return;
    value = newValue;
    listeners.forEach(l => l(value));
  }

  function subscribe(listenerFunc) {
    listeners.push(listenerFunc);
    return () => unsubscribe(listenerFunc);
  }

  function unsubscribe(listenerFunc) {
    listeners = listeners.filter(l => l !== listenerFunc);
  }

  return {
    get,
    set,
    subscribe,
  };
}
