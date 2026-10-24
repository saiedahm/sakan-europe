import { NextRequest, NextResponse } from "next/server";
import { mapCategory, retailPrice75, upsertCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type CJProduct = {
  pid?: string; id?: string; productNameEn?: string; productName?: string;
  description?: string; bigImage?: string; productImage?: string;
  productImageSet?: string[]; sellPrice?: string | number;
  categoryName?: string; category?: string; stock?: number | string; inventory?: number | string;
};
function numberValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const raw = String(value).trim();
  // CJ can return a price range such as "8.13-8.62"; use the lower supplier price.
  const first = raw.split("-")[0].trim();
  const parsed = Number(first);
  return Number.isFinite(parsed) ? parsed : null;
}
async function fetchProducts(keyword: string, token: string): Promise<CJProduct[]> {
  const url = new URL("https://developers.cjdropshipping.com/api2.0/v1/product/listV2");
  url.searchParams.set("page", "1");
  url.searchParams.set("size", "100");
  url.searchParams.set("keyWord", keyword);
  const response = await fetch(url, {
    headers: { "CJ-Access-Token": token, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`CJ API HTTP ${response.status} for "${keyword}"`);
  const body = await response.json();
  if (body?.result === false || (body?.code && Number(body.code) !== 200)) {
    throw new Error(`CJ API error: ${String(body.message || body.code || "unknown error")}`);
  }
  const data = body?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.records)) return data.records;
  return [];
}
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const token = process.env.CJ_ACCESS_TOKEN;
  if (!token || !process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, message: "Configure CJ_ACCESS_TOKEN and DATABASE_URL in Vercel environment variables." }, { status: 503 });
  }
  try {
    // A small parallel batch is intentional: Vercel Hobby functions have execution limits.
    const searches = ["bedroom furniture", "kids bed", "bedding decor", "living room furniture"];
    const batches = await Promise.all(searches.map(keyword => fetchProducts(keyword, token)));
    const unique = new Map<string, CJProduct>();
    for (const p of batches.flat()) {
      const id = String(p.pid || p.id || "").trim();
      if (id) unique.set(id, p);
    }
    const mapped: Array<{
      id:string; supplierId:string; name:string; description:string; imageUrl:string;
      images:string[]; supplierPrice:number; retailPrice:number; currency:string;
      category:"master-bedrooms"|"kids-bedrooms"|"luxury-furniture"|"bedding-decor";
      supplierCategory:string; stock:number|null;
    }> = [];
    let skipped = 0;
    for (const p of unique.values()) {
      const supplierId = String(p.pid || p.id || "").trim();
      const name = String(p.productNameEn || p.productName || "").trim();
      const supplierCategory = String(p.categoryName || p.category || "").trim();
      const category = mapCategory(`${name} ${supplierCategory}`);
      const supplierPrice = numberValue(p.sellPrice);
      if (!supplierId || !name || !category || supplierPrice === null || supplierPrice <= 0) { skipped++; continue; }
      const images = Array.isArray(p.productImageSet)
        ? p.productImageSet.filter((x): x is string => typeof x === "string" && /^https:\/\//i.test(x)).slice(0, 12)
        : [];
      const primary = p.bigImage || p.productImage || "";
      const imageUrl = typeof primary === "string" && /^https:\/\//i.test(primary) ? primary : (images[0] || "");
      const stockValue = numberValue(p.stock ?? p.inventory);
      mapped.push({
        id:`cj-${supplierId}`, supplierId, name,
        description:typeof p.description === "string" ? p.description.replace(/<[^>]*>/g," ").slice(0,5000) : "",
        imageUrl, images, supplierPrice, retailPrice:retailPrice75(supplierPrice), currency:"USD",
        category, supplierCategory, stock:stockValue === null ? null : Math.max(0,Math.trunc(stockValue)),
      });
    }
    const importedOrUpdated = await upsertCatalogProducts(mapped);
    return NextResponse.json({
      success:true, message:"CJ catalog sync completed.", fetched:unique.size,
      importedOrUpdated, skipped, markupPercent:75,
      note:"CJ prices are USD. Configure a verified currency conversion before displaying converted EUR prices."
    });
  } catch (error) {
    console.error("CJ catalog sync failed:", error);
    return NextResponse.json({ success:false, message:error instanceof Error ? error.message : "Catalog sync failed." }, { status:502 });
  }
}
