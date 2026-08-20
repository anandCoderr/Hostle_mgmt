// USE WHEN: building or parsing a URL query string — pure helpers, no network or auth.

/**
 * Plain URL helpers shared by the API instances.
 *
 * `queryStringToJSON` used to live in encryption.js purely because the crypto
 * helpers happened to be its only callers. It has nothing to do with
 * encryption, so it stayed behind when that file was removed.
 */

/** Parse `a=1&b=2` into `{ a: "1", b: "2" }`. */
export function queryStringToJSON(query) {
  if (!query) return {};
  return Object.fromEntries(new URLSearchParams(query));
}

/**
 * Build a query string, dropping empty/undefined/null values.
 *
 * URLSearchParams stringifies `undefined`/`null` into the literal text
 * "undefined"/"null", which backends then try to validate. Filtering here
 * keeps those out of the URL entirely.
 */
export function buildQuery(params) {
  if (!params || !Object.keys(params).length) return "";
  const cleaned = Object.entries(params).filter(
    ([, v]) => v !== "" && v !== undefined && v !== null,
  );
  if (!cleaned.length) return "";
  return new URLSearchParams(Object.fromEntries(cleaned)).toString();
}
