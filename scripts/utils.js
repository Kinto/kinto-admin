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

export function recordField(displayField, record) {
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
  } else if (displayField.indexOf('.') !== -1) {
    const fields = displayField.split('.');

    if (record.hasOwnProperty(fields[0])) {
      return recordField(fields.splice(1).join('.'), record[fields[0]]);
    }
  }
  return "<unknown>";
}
