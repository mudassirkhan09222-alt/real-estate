import { REST_DELETE, REST_GET, REST_PATCH, REST_POST } from "@payloadcms/next/routes";
import configPromise from "@payload-config";

// Payload 3 REST handlers use a curry pattern: REST_GET(config) returns a route handler
export const GET = REST_GET(configPromise);
export const POST = REST_POST(configPromise);
export const DELETE = REST_DELETE(configPromise);
export const PATCH = REST_PATCH(configPromise);
