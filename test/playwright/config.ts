import { DEFAULT_KINTO_SERVER } from "@src/constants"

export const baseUrl = process.env.admin_url || "http://localhost:3000/";
export const baseApi = process.env.api_url || DEFAULT_KINTO_SERVER;

export const baseConfig = {
  project_name: "kinto",
  project_version: "1",
  http_api_version: "1.22",
  project_docs: "https://kinto.readthedocs.io/",
  url: baseApi,
  settings: {
    batch_max_requests: 25,
    readonly: false,
    explicit_permissions: true
  },
  capabilities: {
    default_bucket: {
      description: "The default bucket is an alias for a personal bucket where collections are created implicitly.",
      url: "https://kinto.readthedocs.io/en/latest/api/1.x/buckets.html#personal-bucket-default"
    },
    admin: {
      description: "Serves the admin console.",
      url: "https://github.com/Kinto/kinto-admin/",
      version: "0.0.0-dev"
    },
    accounts: {
      description: "Manage user accounts.",
      url: "https://kinto.readthedocs.io/en/latest/api/1.x/accounts.html",
      validation_enabled: false
    },
    permissions_endpoint: {
      description: "The permissions endpoint can be used to list all user objects permissions.",
      url: "https://kinto.readthedocs.io/en/latest/configuration/settings.html#activating-the-permissions-endpoint"
    }
  }
};

export const authenticatedConfig = {
  ...baseConfig,
  user: {
    id: "user",
    principals: ["account:user"]
  }
};

export const authenticatedStorageStage = {
  cookies: [],
  origins: [
    {
      origin: baseUrl.match(/http:\/\/([a-z0-9A-Z]+:?\d+)/)[1],
      localStorage: [
        {
          name: "kinto-admin-server-history",
          value: JSON.stringify([
            { 
              server: baseApi,
              authType: "accounts"
            }
          ])
        }, {
          name: "kinto-admin-session",
          value: JSON.stringify({
            busy: false,
            authenticating: false,
            auth: {
              server: baseApi,
              credentials: {
                username: "user",
                password: "pass"
              },
              authType: "accounts",
              redirectURL: null
            },
            authenticated: true,
            permissions: [
              {
                uri: "/buckets/test-bucket",
                resource_name: "bucket",
                permissions: [
                  "collection:create",
                  "read:attributes",
                  "group:create",
                  "read",
                  "write"
                ],
                id: "test-bucket",
                bucket_id: "test-bucket"
              },
              {
                uri: "/accounts/user",
                resource_name: "account",
                permissions: [
                  "read",
                  "write"
                ],
                id: "user",
                account_id: "user"
              },
              {
                uri: "/",
                resource_name: "root",
                permissions: [
                  "account:create",
                  "bucket:create"
                ]
              }
            ],
            buckets: [],
            serverInfo: authenticatedConfig,
            redirectURL: null
          })
        } 
      ]
    }
  ]
};
