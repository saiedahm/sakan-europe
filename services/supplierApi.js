/**
 * SAKAN EUROPE — B2B supplier integration foundation.
 *
 * Provider APIs are intentionally adapter-driven: VidaXL and BigBuy credentials,
 * endpoints, payload schemas, and order endpoints differ by account/contract.
 * Configure only the official API endpoints and credentials supplied by your vendor.
 *
 * Environment:
 *   SUPPLIER_PROVIDER=vidaxl|bigbuy|custom
 *   SUPPLIER_API_BASE_URL=https://...
 *   SUPPLIER_API_KEY=...
 *   SUPPLIER_API_TOKEN=...                 (optional bearer token)
 *   SUPPLIER_PRODUCTS_PATH=/products        (provider-specific)
 *   SUPPLIER_ORDERS_PATH=/orders            (provider-specific)
 *   SUPPLIER_MARKUP_PERCENT=30
 *
 * Do not expose credentials in browser code or commit .env files.
 */

const CATEGORY_RULES = [
  {
    id: "master-bedrooms",
    tags: ["beds", "double bed frame", "wardrobe", "nightstand"],
  },
  {
    id: "kids-bedrooms",
    tags: ["kids bed", "bunk bed", "children desk", "youth wardrobe"],
  },
  {
    id: "luxury-furniture",
    tags: ["armchair", "accent table", "console", "sideboard", "luxury lighting"],
  },
  {
    id: "bedding-decor",
    tags: ["bed linen", "duvet cover", "silk pillows", "wall art", "vases"],
  },
];

const DEFAULT_TIMEOUT_MS = 15000;

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectProductTerms(product) {
  const values = [
    product?.name,
    product?.title,
    product?.category,
    product?.categoryName,
    ...(Array.isArray(product?.tags) ? product.tags : []),
    ...(Array.isArray(product?.categories) ? product.categories : []),
    product?.taxonomy,
  ];
  return values.flatMap((value) => {
    if (typeof value === "string") return [normalizeText(value)];
    if (value && typeof value === "object") {
      return [normalizeText(value.name), normalizeText(value.label), normalizeText(value.slug)]
        .filter(Boolean);
    }
    return [];
  });
}

/** Returns a store category ID or null when no configured taxonomy rule matches. */
export function mapSupplierCategory(product) {
  const terms = collectProductTerms(product);
  for (const category of CATEGORY_RULES) {
    const match = category.tags.some((tag) =>
      terms.some((term) => term === tag || term.includes(tag))
    );
    if (match) return category.id;
  }
  return null;
}

/** Applies a percentage markup to a non-negative supplier cost. */
export function calculateRetailPrice(wholesalePrice, markupPercent = 30) {
  const cost = Number(wholesalePrice);
  const markup = Number(markupPercent);
  if (!Number.isFinite(cost) || cost < 0) throw new TypeError("wholesalePrice must be a non-negative number");
  if (!Number.isFinite(markup) || markup < 0 || markup > 1000) throw new TypeError("markupPercent must be between 0 and 1000");
  return Math.round((cost * (1 + markup / 100) + Number.EPSILON) * 100) / 100;
}

/** Convert common supplier feed fields into the storefront's stable product shape. */
export function normalizeSupplierProduct(product, options = {}) {
  if (!product || typeof product !== "object") throw new TypeError("Each supplier product must be an object");
  const sku = String(product.sku ?? product.SKU ?? product.reference ?? product.id ?? "").trim();
  if (!sku) return null;

  const wholesalePrice = Number(
    product.wholesalePrice ?? product.wholesale_price ?? product.price ?? product.priceAmount
  );
  const markupPercent = options.markupPercent ?? 30;
  const category = mapSupplierCategory(product);
  const stockRaw = product.stock ?? product.quantity ?? product.inventory ?? 0;
  const stock = Number(stockRaw);

  return {
    sku,
    title: String(product.title ?? product.name ?? product.productName ?? sku),
    description: String(product.description ?? ""),
    category,
    wholesalePrice: Number.isFinite(wholesalePrice) && wholesalePrice >= 0 ? wholesalePrice : null,
    retailPrice: Number.isFinite(wholesalePrice) && wholesalePrice >= 0
      ? calculateRetailPrice(wholesalePrice, markupPercent)
      : null,
    currency: String(product.currency ?? "EUR").toUpperCase(),
    stock: Number.isFinite(stock) ? Math.max(0, Math.trunc(stock)) : 0,
    imageUrl: product.imageUrl ?? product.image_url ?? product.image ?? null,
    source: String(options.provider ?? process.env.SUPPLIER_PROVIDER ?? "custom"),
    supplierProductId: String(product.id ?? product.productId ?? sku),
    syncedAt: new Date().toISOString(),
  };
}

function safePath(path) {
  if (!path || typeof path !== "string") throw new Error("A provider-specific API path is required");
  if (/^https?:\/\//i.test(path)) throw new Error("API paths must be relative; configure the base URL separately");
  return path.startsWith("/") ? path : `/${path}`;
}

async function request(path, init = {}) {
  const baseUrl = requiredEnv("SUPPLIER_API_BASE_URL").replace(/\/+$/, "");
  const apiKey = requiredEnv("SUPPLIER_API_KEY");
  const token = process.env.SUPPLIER_API_TOKEN;
  const url = new URL(safePath(path), `${baseUrl}/`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
    const body = await response.text();
    let data;
    try { data = body ? JSON.parse(body) : null; }
    catch { data = { raw: body.slice(0, 1000) }; }
    if (!response.ok) {
      const error = new Error(`Supplier API request failed (${response.status})`);
      error.status = response.status;
      error.details = data;
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch a supplier feed. The exact endpoint and response shape must match the
 * API contract enabled for your VidaXL/BigBuy account.
 */
export async function fetchSupplierProducts(options = {}) {
  const path = options.path ?? process.env.SUPPLIER_PRODUCTS_PATH;
  if (!path) throw new Error("Set SUPPLIER_PRODUCTS_PATH to the official provider products endpoint");
  const data = await request(path, { method: "GET" });
  const items = Array.isArray(data) ? data : data?.products ?? data?.items ?? data?.data;
  if (!Array.isArray(items)) throw new Error("Unrecognized supplier feed shape; add a provider-specific response adapter");
  const markupPercent = options.markupPercent ?? Number(process.env.SUPPLIER_MARKUP_PERCENT ?? 30);
  const provider = process.env.SUPPLIER_PROVIDER ?? "custom";
  const products = items
    .map((item) => normalizeSupplierProduct(item, { markupPercent, provider }))
    .filter(Boolean);
  return {
    fetched: items.length,
    mapped: products.filter((product) => product.category).length,
    uncategorized: products.filter((product) => !product.category).length,
    products,
  };
}

/**
 * Dispatch a paid order to the configured supplier.
 * Call only from a verified payment webhook after checking payment status,
 * order idempotency, address consent, and SKU/variant availability.
 * This function does not charge a supplier card or guarantee an order was accepted.
 */
export async function dispatchSupplierOrder(order, options = {}) {
  if (!order || typeof order !== "object") throw new TypeError("order is required");
  if (!order.id) throw new Error("order.id is required for audit and idempotency");
  if (order.paymentStatus !== "paid") throw new Error("Supplier dispatch is allowed only for verified paid orders");
  if (!Array.isArray(order.items) || order.items.length === 0) throw new Error("order.items must contain at least one item");
  const address = order.shippingAddress;
  if (!address || !address.name || !address.address1 || !address.postalCode || !address.city || !address.country) {
    throw new Error("Complete customer shipping address is required");
  }

  const path = options.path ?? process.env.SUPPLIER_ORDERS_PATH;
  if (!path) throw new Error("Set SUPPLIER_ORDERS_PATH to the official provider order endpoint");

  const payload = {
    externalOrderId: String(order.id),
    currency: order.currency ?? "EUR",
    items: order.items.map((item) => {
      if (!item.sku || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
        throw new Error("Each order item requires a supplier SKU and positive integer quantity");
      }
      return {
        sku: String(item.sku),
        quantity: Number(item.quantity),
        ...(item.variantId ? { variantId: String(item.variantId) } : {}),
      };
    }),
    shippingAddress: {
      name: String(address.name),
      company: address.company ? String(address.company) : undefined,
      address1: String(address.address1),
      address2: address.address2 ? String(address.address2) : undefined,
      postalCode: String(address.postalCode),
      city: String(address.city),
      region: address.region ? String(address.region) : undefined,
      country: String(address.country),
      email: order.customerEmail ? String(order.customerEmail) : undefined,
      phone: address.phone ? String(address.phone) : undefined,
    },
    shippingInstructions: "Neutral/white-label packaging requested where supported by supplier.",
    invoiceBrand: {
      name: "SAKAN EUROPE",
      owner: "Akhmed Ismail Saied",
      address: "Ehndorfer Straße, Neumünster, Germany",
    },
  };

  return request(path, {
    method: "POST",
    headers: { "Idempotency-Key": String(order.id) },
    body: JSON.stringify(payload),
  });
}

/** Convert the provider's tracking response to a consistent shape for your webhook/email layer. */
export function normalizeTrackingEvent(event) {
  if (!event || typeof event !== "object") throw new TypeError("Tracking event must be an object");
  const trackingNumber = event.trackingNumber ?? event.tracking_number ?? event.trackingCode ?? event.tracking_code;
  if (!trackingNumber) throw new Error("Tracking number missing from supplier event");
  return {
    orderId: String(event.externalOrderId ?? event.orderId ?? event.order_id ?? ""),
    trackingNumber: String(trackingNumber),
    carrier: String(event.carrier ?? event.carrierName ?? event.shippingProvider ?? "unknown"),
    trackingUrl: event.trackingUrl ?? event.tracking_url ?? null,
    status: String(event.status ?? "shipped"),
  };
}
