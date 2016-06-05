import React from "react";

export function saveSettings(data) {
  localStorage.setItem("kwac_settings", JSON.stringify(data));
}

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem("kwac_settings"));
  } catch(err) {
    return null;
  }
}

export function omit(obj, keys=[]) {
  return Object.keys(obj).reduce((acc, key) => {
    return keys.includes(key) ? acc : {...acc, [key]: obj[key]};
  }, {});
}

export function isObject(thing) {
  return typeof thing === "object" && thing !== null && !Array.isArray(thing);
}

export function validJSON(string) {
  try {
    JSON.parse(string);
    return true;
  } catch(err) {
    return false;
  }
}

export function isHTTPok(status) {
  return [1, 2, 3].some(c => String(status).startsWith(c));
}

export function validateSchema(jsonSchema) {
  let schema;
  try {
    schema = JSON.parse(jsonSchema);
  } catch(err) {
    throw "The schema is not valid JSON";
  }
  const checks = [
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

export function cleanRecord(record) {
  return omit(record, ["id", "schema", "last_modified"]);
}


function handleNestedDisplayField(record, displayField) {
  const fields = displayField.split(".");

  // If the first part matches, we try to render its value.
  if (record.hasOwnProperty(fields[0])) {
    return renderDisplayField(record[fields[0]], fields.slice(1).join("."));
  }

  // In case we have properties containing dots,
  // we look for other candidates in the record properties.
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

export function linkify(string) {
  if (/https?:\/\//.test(string)) {
    return <a href={string} title={string} target="_blank">{string}</a>;
  }
  return string;
}

export function renderDisplayField(record, displayField) {
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

export function parseDataURL(dataURL) {
  const regex = /^data:(.*);base64,(.*)/;
  const match = dataURL.match(regex);
  if (!match) {
    throw new Error(`Invalid data-url: ${String(dataURL).substr(0, 32)}...`);
  }
  const props = match[1];
  const base64 = match[2];
  const [type, ...rawParams] = props.split(";");
  const params = rawParams.reduce((acc, param) => {
    const [key, value] = param.split("=");
    return {...acc, [key]: value};
  }, {});
  return {...params, type, base64};
}

export function extractFileInfo(dataURL) {
  const {Blob, Uint8Array} = window;
  const {name, type, base64} = parseDataURL(dataURL);
  const binary = atob(base64);
  const array = [];
  for(let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  const blob = new Blob([new Uint8Array(array)], {type});
  return {name, blob};
}

export function createFormData(record) {
  const {FormData} = window;
  const attachment = record.__attachment__; // data-url
  const {blob, name} = extractFileInfo(attachment);
  const formData = new FormData();
  formData.append("attachment", blob, name);
  formData.append("data", JSON.stringify(omit(record, "__attachment__")));
  return formData;
}
