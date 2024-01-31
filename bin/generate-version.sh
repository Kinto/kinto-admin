#! /bin/bash

CURL_LATEST_RELEASE_VERSION="curl -s https://api.github.com/repos/Kinto/kinto-admin/releases/latest | jq -r .tag_name"
KINTO_ADMIN_VERSION_FALLBACK=$(git describe --tags --abbrev=4) || eval "$CURL_LATEST_RELEASE_VERSION"

if [ -n "$KINTO_ADMIN_VERSION" ]; then
    VERSION="${KINTO_ADMIN_VERSION}"
else
    VERSION="${KINTO_ADMIN_VERSION_FALLBACK#v}"
fi

echo "$VERSION" > public/VERSION
