export function authenticate(browser, username, password) {
  return browser
    .goto("http://localhost:3000/")
    .wait(".rjsf")
    .type("#root_server", "")
    .type("#root_server", "http://0.0.0.0:8888/v1")
    .type("#root_credentials_username", "")
    .type("#root_credentials_username", username)
    .type("#root_credentials_password", "")
    .type("#root_credentials_password", password)
    .click(".rjsf button.btn.btn-info")
    .wait(".session-info-bar");
}
