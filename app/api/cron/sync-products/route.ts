import { NextRequest, NextResponse } from "next/server";
import {
  mapCategory, mapSubcategory, makeTags, retailPrice75, existingSupplierIds,
  upsertCatalogProducts, getCatalogSyncPage, setCatalogSyncPage
} from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TARGET = 400;
const BATCH_SIZE = 25;
const DEADLINE_MS = 42_000;

type CJProduct = {
  pid?: string; id?: string; productNameEn?: string; productName?: string;
  description?: string; bigImage?: string; productImage?: string; productImageSet?: string[];
  sellPrice?: string | number; categoryName?: string; category?: string;
  stock?: number | string; inventory?: number | string;
};
function numberValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(String(value).trim().split("-")[0].trim());
  return Number.isFinite(parsed) ? parsed : null;
}
function getItems(body: any): CJProduct[] {
  const data = body?.data;
  if (Array.isArray(data)) return data;
  for (const key of ["list", "content", "records", "products"]) if (Array.isArray(data?.[key])) return data[key];
  return [];
}
async function fetchPage(keyword: string, page: number, token: string): Promise<CJProduct[]> {
  const url = new URL("https://developers.cjdropshipping.com/api2.0/v1/product/listV2");
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", "100");
  url.searchParams.set("keyWord", keyword);
  const response = await fetch(url, {
    headers: { "CJ-Access-Token": token, Accept: "application/json" },
    cache: "no-store", signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw new Error(`CJ API HTTP ${response.status} for "${keyword}" page ${page}`);
  const body = await response.json();
  if (body?.result === false || (body?.code && Number(body.code) !== 200)) {
    throw new Error(`CJ API error: ${String(body.message || body.code || "unknown error")}`);
  }
  return getItems(body);
}

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ success: false, requestId, message: "Unauthorized" }, { status: 401 });
    }
    const token = process.env.CJ_ACCESS_TOKEN;
    if (!token || !process.env.DATABASE_URL) {
      return NextResponse.json({ success: false, requestId, message: "Configure CJ_ACCESS_TOKEN and DATABASE_URL in Vercel." }, { status: 503 });
    }

    const searches = [
      { keyword: "master bedroom furniture" },
      { keyword: "kids bedroom bed" },
      { keyword: "bedding home decor" },
      { keyword: "living room furniture" }
    ] as const;
    const startedAt = Date.now();
    const page = await getCatalogSyncPage();
    const existing = await existingSupplierIds();
    if (existing.size >= TARGET) {
      return NextResponse.json({ success: true, requestId, target: TARGET, existingRecords: existing.size, inserted: 0, complete: true, message: "Target of 400 catalog products already reached." }, { status: 200 });
    }
    const remainingTarget = TARGET - existing.size;
    const seen = new Set<string>();
    const candidates: Array<{
      id: string; supplierId: string; name: string; description: string; imageUrl: string; images: string[];
      supplierPrice: number; retailPrice: number; currency: string;
      category: "master-bedrooms" | "kids-bedrooms" | "luxury-furniture" | "bedding-decor";
      subcategory: string; tags: string[]; supplierCategory: string; stock: number | null;
    }> = [];
    const categoryCounts: Record<string, number> = {
      "master-bedrooms": 0, "kids-bedrooms": 0, "luxury-furniture": 0, "bedding-decor": 0
    };
    let fetched = 0, skipped = 0;
    const pageResults = await Promise.all(searches.map(s => fetchPage(s.keyword, page, token)));
    fetched = pageResults.reduce((sum, items) => sum + items.length, 0);

    for (let searchIndex = 0; searchIndex < searches.length; searchIndex++) {
      const search = searches[searchIndex];
      for (const p of pageResults[searchIndex]) {
        const supplierId = String(p.pid || p.id || "").trim();
        if (!supplierId || seen.has(supplierId) || existing.has(supplierId)) continue;
        seen.add(supplierId);
        const name = String(p.productNameEn || p.productName || "").replace(/\s+/g, " ").trim();
        const supplierCategory = String(p.categoryName || p.category || "").trim();
        const category = mapCategory(`${name} ${supplierCategory} ${search.keyword}`);
        const supplierPrice = numberValue(p.sellPrice);
        const images = Array.isArray(p.productImageSet)
          ? p.productImageSet.filter((x): x is string => typeof x === "string" && /^https:\/\//i.test(x)).slice(0, 12)
          : [];
        const primary = [p.bigImage, p.productImage].find(x => typeof x === "string" && /^https:\/\//i.test(x));
        const imageUrl = (primary as string | undefined) || images[0] || "";
        if (!name || !/^[\x20-\x7E\u00A0-\u024F]+$/.test(name) || !category || supplierPrice === null || supplierPrice <= 0 || !imageUrl) {
          skipped++; continue;
        }
        const subcategory = mapSubcategory(category, `${name} ${supplierCategory}`);
        const tags = makeTags(category, subcategory, `${name} ${supplierCategory} ${p.description || ""}`);
        const stockValue = numberValue(p.stock ?? p.inventory);
        candidates.push({
          id: `cj-${supplierId}`, supplierId, name,
          description: typeof p.description === "string" ? p.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 5000) : "",
          imageUrl, images: [imageUrl, ...images.filter(x => x !== imageUrl)].slice(0, 12),
          supplierPrice, retailPrice: retailPrice75(supplierPrice), currency: "USD", category, subcategory, tags,
          supplierCategory, stock: stockValue === null ? null : Math.max(0, Math.trunc(stockValue))
        });
        categoryCounts[category]++;
      }
    }

    if (Date.now() - startedAt > DEADLINE_MS) {
      return NextResponse.json({
        success: false, requestId, message: "Time budget reached before database write; retry safely.",
        page, fetched, eligible: candidates.length, inserted: 0, nextPage: page, retryable: true
      }, { status: 200 });
    }

    const batch = candidates.slice(0, Math.min(BATCH_SIZE, remainingTarget));
    if (batch.length > 0) {
      const inserted = await upsertCatalogProducts(batch, { insertOnly: true });
      // Keep the page until all eligible products from that page have been handled.
      const nextPage = candidates.length > batch.length ? page : page + 1;
      await setCatalogSyncPage(nextPage);
      return NextResponse.json({
        success: true, requestId, target: TARGET, page, batchSize: BATCH_SIZE,
        eligibleOnPage: candidates.length, inserted, fetched, skipped, categoryCounts,
        nextPage, complete: false, markupPercent: 75,
        priceRule: "floor(supplierPrice * 1.75) + 0.99", currency: "USD",
        message: `Committed batch of ${inserted}; call cron again to continue safely.`
      }, { status: 200 });
    }

    // No eligible unseen items remain on this page, so move the persistent cursor forward.
    await setCatalogSyncPage(page + 1);
    return NextResponse.json({
      success: true, requestId, target: TARGET, page, batchSize: BATCH_SIZE,
      eligibleOnPage: 0, inserted: 0, fetched, skipped, nextPage: page + 1,
      complete: false, message: "No new eligible products on this page; next run advances to the next page."
    }, { status: 200 });
  } catch (error) {
    console.error("CJ batched catalog sync failed", {
      requestId,
      message: error instanceof Error ? error.message : "Unknown internal error"
    });
    return NextResponse.json({
      success: false, requestId,
      message: error instanceof Error ? error.message : "Catalog sync failed.",
      retryable: true
    }, { status: 502 });
  }
}
