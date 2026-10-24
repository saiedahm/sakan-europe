import { NextRequest, NextResponse } from "next/server";
import { mapCategory, mapSubcategory, makeTags, retailPrice75, existingSupplierIds, upsertCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
const TARGET = 400;
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
  const response = await fetch(url, { headers: { "CJ-Access-Token": token, Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`CJ API HTTP ${response.status} for "${keyword}" page ${page}`);
  const body = await response.json();
  if (body?.result === false || (body?.code && Number(body.code) !== 200)) throw new Error(`CJ API error: ${String(body.message || body.code || "unknown error")}`);
  return getItems(body);
}
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ success:false, message:"Unauthorized" }, { status:401 });
  const token = process.env.CJ_ACCESS_TOKEN;
  if (!token || !process.env.DATABASE_URL) return NextResponse.json({ success:false, message:"Configure CJ_ACCESS_TOKEN and DATABASE_URL in Vercel." }, { status:503 });
  try {
    const searches = [
      { keyword:"master bedroom furniture", category:"master-bedrooms" },
      { keyword:"kids bedroom bed", category:"kids-bedrooms" },
      { keyword:"bedding home decor", category:"bedding-decor" },
      { keyword:"living room furniture", category:"luxury-furniture" }
    ] as const;
    const existing = await existingSupplierIds();
    const seen = new Set<string>();
    const candidates: Array<{
      id:string; supplierId:string; name:string; description:string; imageUrl:string; images:string[];
      supplierPrice:number; retailPrice:number; currency:string;
      category:"master-bedrooms"|"kids-bedrooms"|"luxury-furniture"|"bedding-decor";
      subcategory:string; tags:string[]; supplierCategory:string; stock:number|null;
    }> = [];
    const categoryCounts: Record<string,number> = { "master-bedrooms":0, "kids-bedrooms":0, "luxury-furniture":0, "bedding-decor":0 };
    let fetched = 0, skipped = 0, pagesFetched = 0;
    // Rotate across category searches and paginate until the UI-sized 400-product target is reached.
    for (let page = 1; page <= 20 && candidates.length < TARGET; page++) {
      const pageBatches = await Promise.all(searches.map(search => fetchPage(search.keyword, page, token)));
      pagesFetched += pageBatches.length;
      fetched += pageBatches.reduce((sum, items) => sum + items.length, 0);
      for (let searchIndex = 0; searchIndex < searches.length; searchIndex++) {
        const search = searches[searchIndex];
        const items = pageBatches[searchIndex];
        if (candidates.length >= TARGET) break;
        if (items.length === 0) continue;
        for (const p of items) {
          if (candidates.length >= TARGET) break;
          const supplierId = String(p.pid || p.id || "").trim();
          if (!supplierId || seen.has(supplierId) || existing.has(supplierId)) continue;
          seen.add(supplierId);
          const name = String(p.productNameEn || p.productName || "").replace(/\s+/g," ").trim();
          const supplierCategory = String(p.categoryName || p.category || "").trim();
          const category = mapCategory(`${name} ${supplierCategory} ${search.keyword}`);
          const supplierPrice = numberValue(p.sellPrice);
          const images = Array.isArray(p.productImageSet) ? p.productImageSet.filter((x): x is string => typeof x === "string" && /^https:\/\//i.test(x)).slice(0,12) : [];
          const primary = [p.bigImage,p.productImage].find(x => typeof x === "string" && /^https:\/\//i.test(x));
          const imageUrl = (primary as string | undefined) || images[0] || "";
          // Only persist products with an ID, an English/Latin title, a positive price and a usable image.
          if (!name || !/^[\x20-\x7E\u00A0-\u024F]+$/.test(name) || !category || supplierPrice === null || supplierPrice <= 0 || !imageUrl) { skipped++; continue; }
          const subcategory = mapSubcategory(category, `${name} ${supplierCategory}`);
          const tags = makeTags(category, subcategory, `${name} ${supplierCategory} ${p.description || ""}`);
          const stockValue = numberValue(p.stock ?? p.inventory);
          candidates.push({
            id:`cj-${supplierId}`, supplierId, name,
            description:typeof p.description === "string" ? p.description.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,5000) : "",
            imageUrl, images:[imageUrl,...images.filter(x=>x!==imageUrl)].slice(0,12),
            supplierPrice, retailPrice:retailPrice75(supplierPrice), currency:"USD", category, subcategory, tags,
            supplierCategory, stock:stockValue === null ? null : Math.max(0,Math.trunc(stockValue))
          });
          categoryCounts[category]++;
        }
      }
    }
    if (candidates.length === 0) {
      return NextResponse.json({ success:false, message:"CJ returned no eligible new products; nothing was inserted.", target:TARGET, eligible:0, fetched, skipped, pagesFetched, existingRecordsExcluded:existing.size, categoryCounts }, { status:502 });
    }
    if (Object.values(categoryCounts).some(count => count === 0)) {
      return NextResponse.json({ success:false, message:"CJ results did not cover all four categories; nothing was inserted.", target:TARGET, eligible:candidates.length, categoryCounts }, { status:502 });
    }
    const inserted = await upsertCatalogProducts(candidates, { insertOnly:true });
    return NextResponse.json({
      success:inserted > 0, target:TARGET, eligible:candidates.length, inserted, fetched, skipped, pagesFetched,
      existingRecordsExcluded:existing.size, categoryCounts, markupPercent:75,
      priceRule:"floor(supplierPrice * 1.75) + 0.99", currency:"USD",
      subcategoriesAndTags:"English metadata-derived values stored per product",
      message:inserted===TARGET ? "UI-sized 400-product target reached." : `Inserted ${inserted} new products from ${candidates.length} eligible candidates; rerun sync to fill remaining UI capacity.`
    }, { status:inserted > 0 ? 200 : 409 });
  } catch (error) {
    console.error("CJ bulk catalog import failed:", error);
    return NextResponse.json({ success:false, message:error instanceof Error ? error.message : "Catalog import failed." }, { status:502 });
  }
}
