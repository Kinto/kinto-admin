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

export function validJSON(string) {
  try {
    JSON.parse(string);
    return true;
  } catch(err) {
    return false;
  }
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

export function renderDisplayField(record, displayField) {
  if (record.hasOwnProperty(displayField)) {
    const field = record[displayField];
    if (typeof field === "string") {
      return field;
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
