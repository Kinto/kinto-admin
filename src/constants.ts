export const DEFAULT_KINTO_SERVER = "https://demo.kinto-storage.org/v1/";
export const ANONYMOUS_AUTH = "anonymous";
export const MAX_PER_PAGE = 200;
export const DEFAULT_SORT = "-last_modified";
export const SINGLE_SERVER = import.meta.env.KINTO_ADMIN_SINGLE_SERVER
  ? document.location.toString().split("/admin/")[0]
  : null;
export const SIDEBAR_MAX_LISTED_COLLECTIONS = 10;

export const DEFAULT_SERVERINFO = {
  url: "",
  capabilities: {},
  project_name: "Kinto",
  project_docs: "https://remote-settings.readthedocs.io/",
};

export const SERVERINFO_WITH_ATTACHMENTS_CAPABILITY = {
  ...DEFAULT_SERVERINFO,
  capabilities: {
    attachments: {},
    ...DEFAULT_SERVERINFO.capabilities,
  },
};

export const SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES = {
  ...DEFAULT_SERVERINFO,
  capabilities: {
    signer: {},
    openid: {},
    history: {
      excluded_resources: [],
    },
    ...DEFAULT_SERVERINFO.capabilities,
  },
};
