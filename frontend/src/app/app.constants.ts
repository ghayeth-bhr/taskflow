/**
 * Base URL of the TaskFlow REST API.
 *
 * The client always calls a relative "/api" path: in development the Angular
 * dev-server proxies it to http://localhost:8080 (proxy.conf.json), and in the
 * Docker Compose stack nginx proxies it to the backend container. Same-origin
 * in both cases, so no CORS pre-flight is needed from the browser.
 */
export const API_URL = '/api';
