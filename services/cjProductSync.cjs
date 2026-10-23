"use strict";

const { put } = require("@vercel/blob");
const { getPool } = require("../lib/db");

const CATEGORY_RULES = [
  // Match children's items first; otherwise the broad "bed"/"bedroom" rules can capture them.
  { id: "kids-bedrooms", terms: ["kids", "kid", "children", "bunk bed", "crib", "toddler", "youth"] },
  { id: "master-bedrooms", terms: ["bed", "bedroom", "wardrobe", "nightstand", "mattress", "bed frame"] },
  { id: "luxury-furniture", terms: ["sofa", "armchair", "furniture", "table", "chair", "cabinet", "dresser", "lamp", "luxury"] },
  { id: "bedding-decor", terms: ["bedding", "duvet", "pillow", "linen", "blanket", "curtain", "decor", "vase", "wall art"] },
];
const timeoutMs = 20000;

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error("Missing required environment variable: " + name);
  return value;
}
function text(value) { return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
function money(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  // Match the approved SAKAN rule: 75% markup, then floor(raw) + 0.99 EUR.
  const rawRetail = n * 1.75;
  return Number((Math.floor(rawRetail) + 0.99).toFixed(2));
}
function categoryFor(p) {
  const haystack = [p.name, p.title, p.productName, p.categoryName, p.category, p.description, ...(Array.isArray(p.tags) ? p.tags : [])].map(text).join(" ").toLowerCase();
  for (const rule of CATEGORY_RULES) if (rule.terms.some(term => haystack.includes(term))) return rule.id;
  return null;
}
function first(...values) { return values.find(v => v !== undefined && v !== null && v !== ""); }
function normalize(p) {
  const sku = text(first(p.sku, p.SKU, p.productSku, p.productSKU, p.productId, p.pid, p.id));
  const cost = Number(first(p.sellPrice, p.productPrice, p.price, p.wholesalePrice, p.wholesale_price));
  if (!sku || !Number.isFinite(cost) || cost <= 0) return null;
  const rawVariants = first(p.variants, p.variantList, p.productVariants, []);
  const variants = (Array.isArray(rawVariants) ? rawVariants : []).map(v => ({
    id: text(first(v.vid, v.variantId, v.id, v.sku)),
    sku: text(first(v.variantSku, v.sku, v.SKU)),
    color: text(first(v.color, v.colorName, v.colour)),
    size: text(first(v.size, v.sizeName)),
    material: text(first(v.material, v.materialName)),
    stock: Math.max(0, Number(first(v.stock, v.inventory, v.quantity, v.variantStock, 0)) || 0)
  }));
  const stock = Math.max(0, Number(first(p.stock, p.inventory, p.quantity, p.totalInventory, p.productInventory, variants.reduce((s,v)=>s+v.stock,0), 0)) || 0);
  const imgs = first(p.productImageSet, p.images, p.imageList, p.imageUrl, p.image, []);
  const imageUrls = (Array.isArray(imgs) ? imgs.map(x => typeof x === "string" ? x : first(x.imageUrl, x.url, x.imgUrl)).filter(Boolean) : [imgs]).map(text).filter(Boolean).slice(0, 12);
  return {
    sku, supplierProductId: text(first(p.pid, p.productId, p.id, sku)),
    title: text(first(p.productName, p.name, p.title, sku)).slice(0, 300),
    description: text(first(p.description, p.productDescription, p.productName, p.name, "Curated for the SAKAN EUROPE collection.")).slice(0, 4000),
    category: categoryFor(p), supplierCost: Math.round(cost * 100) / 100, price: money(cost),
    currency: "EUR", stock: Math.trunc(stock), variants, imageUrls
  };
}
async function requestJson(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal, headers: { Accept: "application/json", ...(init.headers || {}) } });
    const body = await response.text();
    let data; try { data = body ? JSON.parse(body) : {}; } catch { throw new Error("CJ API returned invalid JSON (HTTP " + response.status + ")"); }
    if (!response.ok || (data && data.code && !["200","0",200,0].includes(data.code) && data.success !== true)) {
      throw new Error("CJ API request failed (HTTP " + response.status + ", code " + text(data.code || "unknown") + ")");
    }
    return data;
  } finally { clearTimeout(timer); }
}
async function fetchProducts() {
  const base = (process.env.CJ_API_BASE_URL || "https://developers.cjdropshipping.com/api2.0/v1").replace(/\/+$/, "");
  const token = required("CJ_ACCESS_TOKEN");
  const path = process.env.CJ_PRODUCTS_PATH || "/product/list";
  if (!path.startsWith("/") || path.startsWith("//")) throw new Error("CJ_PRODUCTS_PATH must be a relative API path");
  const limit = Math.min(100, Math.max(1, Number(process.env.CJ_PAGE_SIZE || 50)));
  const maxPages = Math.min(100, Math.max(1, Number(process.env.CJ_MAX_PAGES || 10)));
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const url = new URL(base + path);
    url.searchParams.set("page", String(page));
    url.searchParams.set("size", String(limit));
    const data = await requestJson(url, { headers: { "CJ-Access-Token": token, Authorization: "Bearer " + token } });
    const payload = data.data || data;
    const list = Array.isArray(payload) ? payload : first(payload.content, payload.list, payload.products, payload.records, payload.items, []);
    if (!Array.isArray(list)) throw new Error("Unrecognized CJ product response; configure the endpoint/response adapter for your CJ account.");
    all.push(...list);
    if (list.length < limit || (payload.totalPages && page >= Number(payload.totalPages))) break;
  }
  return all;
}
async function mapLimit(items, limit, fn) {
  let cursor = 0; const results = new Array(items.length);
  const workers = Array.from({length: Math.min(limit, items.length)}, async () => {
    while (true) { const i = cursor++; if (i >= items.length) return; try { results[i] = await fn(items[i], i); } catch (e) { results[i] = { error: e.message }; } }
  });
  await Promise.all(workers); return results;
}
async function storeImage(url, sku, index) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  const parsed = new URL(url);
  if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error("Rejected invalid supplier image URL");
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(parsed, { signal: controller.signal, redirect: "follow" });
    if (!response.ok) throw new Error("Supplier image download failed (HTTP " + response.status + ")");
    const type = (response.headers.get("content-type") || "").split(";")[0].toLowerCase();
    if (!type.startsWith("image/")) throw new Error("Supplier URL did not return an image");
    const declared = Number(response.headers.get("content-length") || 0);
    if (declared > 12 * 1024 * 1024) throw new Error("Supplier image exceeds 12 MB");
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 12 * 1024 * 1024) throw new Error("Supplier image exceeds 12 MB");
    const ext = type === "image/jpeg" ? "jpg" : (type.split("/")[1] || "img").replace(/[^a-z0-9]/g, "").slice(0,8) || "img";
    const blob = await put("sakan-products/" + encodeURIComponent(sku).slice(0,120) + "/" + index + "." + ext, bytes, {
      access: "public", token: process.env.BLOB_READ_WRITE_TOKEN, contentType: type, addRandomSuffix: false, allowOverwrite: true
    });
    return blob.url;
  } finally { clearTimeout(timer); }
}
async function sync() {
  const pool = getPool();
  const raw = await fetchProducts();
  const products = raw.map(normalize).filter(Boolean);
  const concurrency = Math.min(5, Math.max(1, Number(process.env.CJ_SYNC_CONCURRENCY || 3)));
  let imported = 0, failed = 0, uncategorized = 0, imageFailures = 0;
  const outcomes = await mapLimit(products, concurrency, async product => {
    const images = await mapLimit(product.imageUrls, 2, async (url, index) => storeImage(url, product.sku, index));
    const storedImages = images.filter(x => typeof x === "string");
    imageFailures += images.filter(x => x && x.error).length;
    if (!product.category) uncategorized++;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(`INSERT INTO sakan_products
        (sku, supplier_product_id, title, description, category, supplier_cost, price, currency, stock, variants, image_urls, supplier, sync_status, synced_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,'EUR',$8,$9::jsonb,$10::jsonb,'cj','active',NOW(),NOW())
        ON CONFLICT (sku) DO UPDATE SET supplier_product_id=EXCLUDED.supplier_product_id,title=EXCLUDED.title,
        description=EXCLUDED.description,category=EXCLUDED.category,supplier_cost=EXCLUDED.supplier_cost,price=EXCLUDED.price,
        currency='EUR',stock=EXCLUDED.stock,variants=EXCLUDED.variants,
        image_urls=CASE WHEN jsonb_array_length(EXCLUDED.image_urls)>0 THEN EXCLUDED.image_urls ELSE sakan_products.image_urls END,
        supplier='cj',sync_status=CASE WHEN EXCLUDED.stock<=0 THEN 'out_of_stock' ELSE 'active' END,
        synced_at=NOW(),updated_at=NOW()`,
        [product.sku, product.supplierProductId, product.title, product.description, product.category, product.supplierCost, product.price, product.stock, JSON.stringify(product.variants), JSON.stringify(storedImages)]);
      await client.query("COMMIT"); imported++; return { sku: product.sku, ok: true };
    } catch (error) { await client.query("ROLLBACK").catch(()=>{}); failed++; return { sku: product.sku, ok: false, error: error.message }; }
    finally { client.release(); }
  });
  await pool.query("UPDATE sakan_products SET stock=0, sync_status='out_of_stock', updated_at=NOW() WHERE supplier='cj' AND synced_at < NOW() - INTERVAL '2 hours'");
  return { provider:"cj", fetched:raw.length, normalized:products.length, imported, failed, uncategorized, imageFailures, outcomes:outcomes.slice(0,25) };
}
module.exports = { sync, normalize, money, categoryFor };
