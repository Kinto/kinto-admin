import { DEFAULT_KINTO_SERVER } from "@src/constants"

export const baseUrl = process.env.admin_url || "http://localhost:3000/";
export const baseApi = process.env.api_url || DEFAULT_KINTO_SERVER;


