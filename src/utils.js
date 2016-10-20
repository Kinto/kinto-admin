/* @flow */

import type { RecordData } from "./types";
import React from "react";
import _timeago  from "timeago.js";


export function clone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export function omit(obj: Object, keys: string[] = []): Object {
  return Object.keys(obj).reduce((acc:Object, key:string) => {
    return keys.includes(key) ? acc : {...acc, [key]: obj[key]};
  }, {});
}

export function isObject(thing: any): boolean {
  return typeof thing === "object" && thing !== null && !Array.isArray(thing);
}

export function timeago(date: string | number): string {
  // Show relative time according to current timezone.
  return _timeago().format(new Date(date));
}

export function validJSON(string: string): boolean {
  try {
    JSON.parse(string);
    return true;
  } catch(err) {
    return false;
  }
}

export function validateSchema(jsonSchema: string) {
  let schema: Object;
  try {
    schema = JSON.parse(jsonSchema);
  } catch(err) {
    throw "The schema is not valid JSON";
  }
  const checks: Array<{test: () => boolean, error: string}> = [
    {
      test: () => isObject(schema),
      error: "The schema is not an object",
    },
    {
      test: () => schema.hasOwnProperty("type"),
      error: "The schema has no type",
    },
    {
      test: () => schema.type === "object",
      error: "The schema type is not 'object'",
    },
    {
      test: () => schema.hasOwnProperty("properties"),
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
  checks.forEach(({test, error}) => {
    if (!test()) {
      throw error;
    }
  });
  return schema;
}

export function validateUiSchema(jsonUiSchema: string, jsonSchema: string) {
  let uiSchema: Object, schema:Object = JSON.parse(jsonSchema);
  try {
    uiSchema = JSON.parse(jsonUiSchema);
  } catch(err) {
    throw "The uiSchema is not valid JSON";
  }
  const hasOrder: boolean = uiSchema.hasOwnProperty("ui:order");
  let checks: Array<{test: () => boolean, error: string}> = [
    {
      test: () => isObject(uiSchema),
      error: "The uiSchema is not an object",
    }
  ];
  if (hasOrder) {
    const order = uiSchema["ui:order"];
    const properties: string[] = Object.keys(schema.properties);
    const arrayId = (array: string[]): string => array.slice().sort().toString();
    checks = checks.concat([
      {
        test: () => Array.isArray(order),
        error: "The uiSchema ui:order directive isn't an array",
      },
      {
        test: () => arrayId(order) === arrayId(properties),
        error: "The ui:order directive should list all schema properties",
      }
    ]);
  }
  checks.forEach(({test, error}) => {
    if (!test()) {
      throw error;
    }
  });
  return uiSchema;
}

export function cleanRecord(record: RecordData): RecordData {
  return omit(record, ["id", "schema", "last_modified"]);
}


function handleNestedDisplayField(record: RecordData, displayField: string): any {
  const fields = displayField.split(".");

  // If the first part matches, we try to render its value.
  if (record.hasOwnProperty(fields[0])) {
    return renderDisplayField(record[fields[0]], fields.slice(1).join("."));
  }

  // In case we have properties containing dots,
  // we look for other candidates in the record attributes.
  let biggestCandidate = [];
  let candidates = Object.keys(record).filter((key) => {
    return key.indexOf(fields[0] + ".") === 0;
  });

  // For all the properties candidates
  for (let key of candidates) {
    let nextCandidate = [];
    // For all parts of the displayField
    for (let part of fields) {
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
    return <a href={string} title={string} target="_blank">{string}</a>;
  }
  return string;
}

export function renderDisplayField(record: Object, displayField: string): any {
  if (!record) {
    return "<unknown>";
  }
  if (record.hasOwnProperty(displayField)) {
    const field = record[displayField];
    if (typeof field === "string") {
      return linkify(field);
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
  return new Date(parseInt(since, 10)).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) + " UTC";
}
