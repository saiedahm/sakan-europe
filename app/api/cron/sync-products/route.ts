import { NextRequest, NextResponse } from "next/server";
import { mapCategory, retailPrice75, upsertCatalogProducts } from "@/lib/catalog";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

type CJProduct = {
  pid?: string;
  id?: string;
  productNameEn?: string;
  productName?: string;
  description?: string;
  bigImage?: string;
  productImageSet?: string[];
  sellPrice?: string | number;
  categoryName?: string;
  category?: string;
  stock?: number | string;
  inventory?: number | string;
};

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function cjRequest(url: URL, token: string) {
  const response = await fetch(url, {
    headers: { "CJ-Access-Token": token, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`CJ API HTTP ${response.status}`);
  const body = await response.json();
  if (body?.result === false || (body?.code && Number(body.code) !== 200)) {
    throw new Error(`CJ API error: ${String(body.message || body.code || "unknown error")}`);
  }
  return body;
}

function extractList(body: any): CJProduct[] {
  const data = body?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.records)) return data.records;
  return [];
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.CJ_ACCESS_TOKEN;
  if (!token || !process.env.DATABASE_URL) {
    return NextResponse.json(
      { success: false, message: "Configure CJ_ACCESS_TOKEN and DATABASE_URL in deployment environment variables." },
      { status: 503 }
    );
  }

  // Only home/furniture-relevant search terms are imported; unrelated electronics are excluded.
  const searches = [
    "bed frame", "bedroom furniture", "kids bed", "bunk bed",
    "wardrobe", "nightstand", "mattress", "bedding", "duvet",
    "pillow", "blanket", "bedside table", "dresser", "vanity",
    "sofa", "living room furniture", "dining table", "cabinet",
    "curtain", "rug", "home decor", "bedroom lamp"
  ];

  try {
    const unique = new Map<string, CJProduct>();
    for (const keyword of searches) {
      const url = new URL("https://developers.cjdropshipping.com/api2.0/v1/product/listV2");
      url.searchParams.set("page", "1");
      url.searchParams.set("size", "100");
      url.searchParams.set("keyWord", keyword);
      const body = await cjRequest(url, token);
      for (const product of extractList(body)) {
        const id = String(product.pid || product.id || "").trim();
        if (id) unique.set(id, product);
      }
      // Respect supplier API limits rather than sending a burst of requests.
      await new Promise((resolve) => setTimeout(resolve, 550));
    }

    const mapped = [];
    let skipped = 0;
    for (const p of unique.values()) {
      const supplierId = String(p.pid || p.id || "").trim();
      const name = String(p.productNameEn || p.productName || "").trim();
      const supplierCategory = String(p.categoryName || p.category || "").trim();
      const category = mapCategory(`${name} ${supplierCategory}`);
      const supplierPrice = toNumber(p.sellPrice);
      if (!supplierId || !name || !category || supplierPrice === null || supplierPrice <= 0) {
        skipped++;
        continue;
      }
      const images = Array.isArray(p.productImageSet)
        ? p.productImageSet.filter((x): x is string => typeof x === "string" && /^https:\/\//i.test(x)).slice(0, 12)
        : [];
      const imageUrl = typeof p.bigImage === "string" && /^https:\/\//i.test(p.bigImage)
        ? p.bigImage : (images[0] || "");
      const stock = toNumber(p.stock ?? p.inventory);
      mapped.push({
        id: `cj-${supplierId}`, supplierId, name,
        description: typeof p.description === "string" ? p.description.replace(/<[^>]*>/g, " ").slice(0, 5000) : "",
        imageUrl, images, supplierPrice,
        retailPrice: retailPrice75(supplierPrice), currency: "USD",
        category, supplierCategory, stock: stock === null ? null : Math.max(0, Math.trunc(stock))
      });
    }

    const imported = await upsertCatalogProducts(mapped);
    return NextResponse.json({
      success: true,
      message: "CJ catalog sync completed.",
      fetched: unique.size,
      importedOrUpdated: imported,
      skipped,
      markupPercent: 75,
      note: "Retail prices are supplier sellPrice × 1.75. CJ sellPrice is USD; configure storefront currency conversion separately if displaying EUR."
    });
  } catch (error) {
    console.error("CJ catalog sync failed:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Catalog sync failed." },
      { status: 502 }
    );
  }
}
