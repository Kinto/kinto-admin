#!/usr/bin/env node
import { execSync } from "child_process";
import { writeFileSync } from "fs";
import fetch from "node-fetch";

async function getLatestReleaseVersion() {
  const res = await fetch(
    "https://api.github.com/repos/Kinto/kinto-admin/releases/latest",
    { headers: { "user-agent": "Kinto Admin CI" } } // `user-agent` header required by Github API
  );
  const body = await res.json();
  return body.tag_name.replace(/^v/, "");
}

const getGitVersion = () => {
  try {
    return execSync("git describe --tags --abbrev=4", {
      encoding: "utf-8",
    })
      .trim()
      .replace(/^v/, "");
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  /**
   * The `KINTO_ADMIN_VERSION` env var is used when someone wants to download
   * an earlier release and build assets from source. Since they won't be in a
   * `git` directory to be able to pull version information from the latest
   * tag, this allows them to inject the version they're downloading into the bundle.
   */
  const version =
    process.env.KINTO_ADMIN_VERSION ||
    getGitVersion() ||
    (await getLatestReleaseVersion());

  writeFileSync("./public/VERSION", version);
})();
