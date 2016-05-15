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
