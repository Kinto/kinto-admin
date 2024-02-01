#!/usr/bin/env node
import { execSync } from "child_process";
import { writeFileSync } from "fs";
import * as https from "https";

async function getLatestRelease() {
  return new Promise((resolve, reject) => {
    https
      .get(
        "https://api.github.com/repos/Kinto/kinto-admin/releases/latest",
        { headers: { "user-agent": "Kinto Admin CI" } },
        res => {
          let data = "";

          res.on("data", chunk => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              const jsonData = JSON.parse(data);
              const result = jsonData.tag_name;
              resolve(result);
            } catch (error) {
              reject(new Error(`Error parsing JSON: ${error.message}`));
            }
          });
        }
      )
      .on("error", error => {
        reject(new Error(`Error making HTTP request: ${error.message}`));
      });
  });
}

const getGitLatestReleaseVersion = async () => {
  try {
    return execSync("git describe --tags --abbrev=4", {
      encoding: "utf-8",
    }).trim();
  } catch (error) {
    console.log(error);
    return await getLatestRelease();
  }
};

const main = (() => {
  const kintoAdminVersion = process.env.KINTO_ADMIN_VERSION;

  return async () => {
    const version =
      kintoAdminVersion ||
      (await getGitLatestReleaseVersion()).replace(/^v/, "");

    writeFileSync("./public/VERSION", version);
  };
})();

main();
