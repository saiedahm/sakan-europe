/**
 * SAKAN EUROPE — CJ Dropshipping API 2.0 adapter.
 * Server-side only. A browser return URL is never proof of payment.
 * Official docs: https://developers.cjdropshipping.com/en/api/api2/
 */
const CJ_API_BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const REQUEST_TIMEOUT_MS = 15000;
let tokenCache = { accessToken: "", refreshToken: "", expiresAt: 0 };

function env(name, optional = false) {
  const value = process.env[name] ? process.env[name].trim() : "";
  if (!value && !optional) throw new Error("Missing server environment variable: " + name);
  return value;
}

async function parseResponse(response) {
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; }
  catch { throw new Error("CJ API returned a non-JSON response"); }
  if (!response.ok || body.success === false || (body.code && Number(body.code) !== 200)) {
    const error = new Error("CJ API request failed (HTTP " + response.status + ", code " + (body.code || "unknown") + ")");
    error.status = response.status;
    error.cjCode = body.code;
    error.requestId = body.requestId;
    throw error;
  }
  return body;
}

async function postJson(path, body, accessToken) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(CJ_API_BASE + path, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(accessToken ? { "CJ-Access-Token": accessToken } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return await parseResponse(response);
  } finally { clearTimeout(timeout); }
}

async function getAccessToken() {
  const directToken = env("CJ_ACCESS_TOKEN", true);
  if (directToken) return directToken;
  const apiKey = env("CJ_API_KEY", true);
  if (!apiKey) throw new Error("Set CJ_ACCESS_TOKEN or CJ_API_KEY in hosting environment");

  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt - 60000) return tokenCache.accessToken;
  const refreshToken = env("CJ_REFRESH_TOKEN", true) || tokenCache.refreshToken;
  let result;
  if (refreshToken) {
    try { result = await postJson("/authentication/refreshAccessToken", { refreshToken }); }
    catch { result = await postJson("/authentication/getAccessToken", { apiKey }); }
  } else {
    result = await postJson("/authentication/getAccessToken", { apiKey });
  }

  const data = result.data || {};
  if (!data.accessToken) throw new Error("CJ authentication response did not include an access token");
  const expiry = data.accessTokenExpiryDate ? Date.parse(data.accessTokenExpiryDate) : NaN;
  tokenCache = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken || refreshToken,
    expiresAt: Number.isFinite(expiry) ? expiry : Date.now() + 24 * 60 * 60 * 1000,
  };
  return tokenCache.accessToken;
}

export async function cjRequest(path, options = {}) {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("..")) {
    throw new Error("Invalid CJ API path");
  }
  const token = await getAccessToken();
  const url = new URL(CJ_API_BASE + path);
  Object.entries(options.query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        Accept: "application/json",
        ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
        "CJ-Access-Token": token,
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
      signal: controller.signal,
    });
    return await parseResponse(response);
  } finally { clearTimeout(timeout); }
}

/**
 * Creates a CJ order only after the caller has verified provider payment.
 * Requires CJ variant IDs and the exact logistics service selected for the destination.
 * Sandbox defaults ON to prevent accidental real orders.
 *
 * This creates an order only; it does NOT confirm it or pay the CJ supplier balance.
 */
export async function createCjOrderForPaidOrder(order, options = {}) {
  if (!order || typeof order !== "object" || !order.id) throw new Error("Persisted order ID is required");
  if (order.paymentStatus !== "paid" || order.paymentVerified !== true) {
    throw new Error("CJ order creation requires server-verified payment");
  }
  if (!Array.isArray(order.items) || order.items.length === 0) throw new Error("Order must contain items");

  const shipping = order.shippingAddress || {};
  const required = ["name", "address1", "postalCode", "city", "country", "countryCode", "phone"];
  const missing = required.filter((key) => !String(shipping[key] || "").trim());
  if (missing.length) throw new Error("Missing shipping fields: " + missing.join(", "));

  const logisticName = options.logisticName || env("CJ_LOGISTIC_NAME");
  const fromCountryCode = options.fromCountryCode || env("CJ_FROM_COUNTRY_CODE", true) || "CN";
  const sandboxSetting = env("CJ_SANDBOX", true);
  const isSandbox = options.isSandbox === undefined ? sandboxSetting !== "0" : Boolean(options.isSandbox);

  const products = order.items.map((item) => {
    const vid = String(item.variantId || item.vid || "").trim();
    const quantity = Number(item.quantity);
    if (!vid) throw new Error("Each item requires a CJ variantId/vid from the CJ catalog");
    if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error("Each quantity must be a positive integer");
    return { vid, quantity, shippingName: String(item.shippingName || item.title || vid).slice(0, 200) };
  });

  const payload = {
    orderNumber: String(order.id).slice(0, 50),
    shippingCountryCode: String(shipping.countryCode).toUpperCase(),
    shippingCountry: String(shipping.country),
    shippingProvince: String(shipping.region || shipping.province || shipping.city),
    shippingCity: String(shipping.city),
    shippingAddress: String(shipping.address1),
    shippingAddress2: String(shipping.address2 || ""),
    shippingCustomerName: String(shipping.name),
    shippingZip: String(shipping.postalCode),
    shippingPhone: String(shipping.phone),
    remark: "SAKAN EUROPE order",
    logisticName,
    fromCountryCode,
    isSandbox: isSandbox ? 1 : 0,
    products,
  };

  const result = await cjRequest("/shopping/order/createOrder", { method: "POST", body: payload });
  return {
    provider: "cj-dropshipping",
    sandbox: isSandbox,
    cjOrderId: result.data,
    requestId: result.requestId || null,
    status: "created-awaiting-cj-confirmation-and-payment",
  };
}

export async function getCjOrder(cjOrderId) {
  if (!String(cjOrderId || "").trim()) throw new Error("cjOrderId is required");
  return cjRequest("/shopping/order/getOrderDetail", { query: { orderId: String(cjOrderId).trim() } });
}
