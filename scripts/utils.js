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
