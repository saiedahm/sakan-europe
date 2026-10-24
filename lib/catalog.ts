import { Pool } from "pg";

declare global { var __sakanPool: Pool | undefined; }
function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if (!global.__sakanPool) global.__sakanPool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false }, max: 5 });
  return global.__sakanPool;
}
export type CatalogCategory = "master-bedrooms" | "kids-bedrooms" | "luxury-furniture" | "bedding-decor";
export type CatalogProduct = { id:string; supplierId:string; name:string; description:string; imageUrl:string; images:string[]; supplierPrice:number; retailPrice:number; currency:string; category:CatalogCategory; subcategory:string; tags:string[]; supplierCategory:string; stock:number|null; updatedAt:string };
export function retailPrice75(supplierPrice:number) {
  if (!Number.isFinite(supplierPrice) || supplierPrice <= 0) throw new Error("Invalid supplier price");
  return Math.floor(supplierPrice * 1.75) + 0.99;
}
export function mapCategory(name:string):CatalogCategory|null {
  const value=name.toLowerCase();
  if (/kids|children|baby|toddler|crib|bunk bed|youth bedroom|nursery/.test(value)) return "kids-bedrooms";
  if (/bedding|duvet|pillow|bedsheet|bed sheet|blanket|comforter|quilt|curtain|decor|decoration|rug|carpet|lamp|wall art|linen/.test(value)) return "bedding-decor";
  if (/bedroom|bed frame|bedstead|mattress|nightstand|bedside|wardrobe|dresser|vanity|headboard/.test(value)) return "master-bedrooms";
  if (/furniture|sofa|couch|chair|table|cabinet|shelf|bookcase|living room|dining|office desk|armchair/.test(value)) return "luxury-furniture";
  return null;
}
export function mapSubcategory(category:CatalogCategory, text:string):string {
  const value=text.toLowerCase();
  const rules:Record<CatalogCategory,Array<[RegExp,string]>> = {
    "master-bedrooms":[[/bed frame|bedstead|headboard|platform bed/,"Bed Frames"],[/mattress|memory foam/,"Mattresses"],[/wardrobe|closet/,"Wardrobes"],[/nightstand|bedside/,"Bedside Tables"],[/dresser|vanity/,"Dressers & Vanities"],[/bedroom set|bedroom furniture/,"Bedroom Sets"]],
    "kids-bedrooms":[[/bunk bed/,"Bunk Beds"],[/crib|cot|baby bed/,"Cribs & Cots"],[/toddler/,"Toddler Beds"],[/kids desk|study desk/,"Kids Desks"],[/wardrobe|dresser/,"Kids Storage"],[/bed/,"Kids Beds"]],
    "luxury-furniture":[[/sofa|couch|sectional/,"Sofas & Couches"],[/dining table|dining chair/,"Dining Furniture"],[/office desk|office chair/,"Office Furniture"],[/cabinet|sideboard/,"Cabinets & Sideboards"],[/shelf|bookcase/,"Shelving & Bookcases"],[/chair|armchair/,"Chairs & Armchairs"],[/table/,"Tables"]],
    "bedding-decor":[[/duvet|comforter|quilt/,"Duvets & Comforters"],[/pillow/,"Pillows"],[/bedsheet|bed sheet|linen/,"Bed Linen"],[/blanket|throw/,"Blankets & Throws"],[/curtain/,"Curtains"],[/rug|carpet/,"Rugs & Carpets"],[/lamp|lighting/,"Lighting"],[/wall art|decoration|decor/,"Home Decor"]]
  };
  return rules[category].find(([pattern])=>pattern.test(value))?.[1] ?? ({
    "master-bedrooms":"Bedroom Essentials","kids-bedrooms":"Kids Bedroom Essentials",
    "luxury-furniture":"Living & Dining Furniture","bedding-decor":"Bedding & Home Accessories"
  } as Record<CatalogCategory,string>)[category];
}
export function makeTags(category:CatalogCategory, subcategory:string, text:string):string[] {
  const value=text.toLowerCase();
  const tags=new Set<string>([category.replace(/-/g," "),subcategory.toLowerCase()]);
  const keywords:Array<[RegExp,string]> = [
    [/modern|contemporary/,"modern"],[/luxury|premium|elegant/,"luxury"],[/wood|wooden|oak|walnut/,"wood"],[/metal|steel|iron/,"metal"],[/fabric|linen|cotton|velvet/,"fabric"],[/leather/,"leather"],[/storage|drawer|cabinet/,"storage"],[/adjustable/,"adjustable"],[/foldable|folding/,"foldable"],[/minimalist|minimal/,"minimalist"],[/kids|children|baby|toddler/,"kids"],[/queen|king size/,"large size"],[/small|compact/,"compact"]
  ];
  for (const [pattern,tag] of keywords) if (pattern.test(value)) tags.add(tag);
  return [...tags].slice(0,10);
}
export async function ensureCatalogTable() {
  const pool=getPool();
  await pool.query(`CREATE TABLE IF NOT EXISTS sakan_catalog_products (
    id TEXT PRIMARY KEY, supplier_id TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '', image_url TEXT NOT NULL DEFAULT '',
    images JSONB NOT NULL DEFAULT '[]'::jsonb, supplier_price NUMERIC(12,2) NOT NULL,
    retail_price NUMERIC(12,2) NOT NULL, currency TEXT NOT NULL DEFAULT 'USD',
    category TEXT NOT NULL, subcategory TEXT NOT NULL DEFAULT 'Home Essentials',
    tags JSONB NOT NULL DEFAULT '[]'::jsonb, supplier_category TEXT NOT NULL DEFAULT '', stock INTEGER,
    active BOOLEAN NOT NULL DEFAULT TRUE, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query("ALTER TABLE sakan_catalog_products ADD COLUMN IF NOT EXISTS subcategory TEXT NOT NULL DEFAULT 'Home Essentials'");
  await pool.query("ALTER TABLE sakan_catalog_products ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb");
}
export async function listCatalogProducts() {
  await ensureCatalogTable();
  const {rows}=await getPool().query(`SELECT id,supplier_id AS "supplierId",name,description,
    image_url AS "imageUrl",images,supplier_price AS "supplierPrice",retail_price AS "retailPrice",
    currency,category,subcategory,tags,supplier_category AS "supplierCategory",stock,updated_at AS "updatedAt"
    FROM sakan_catalog_products WHERE active=TRUE ORDER BY category,name LIMIT 2000`);
  return rows as CatalogProduct[];
}
export async function upsertCatalogProducts(products:Array<Omit<CatalogProduct,"updatedAt">>) {
  await ensureCatalogTable(); const pool=getPool(); const client=await pool.connect(); let count=0;
  try {
    await client.query("BEGIN");
    for (const p of products) {
      await client.query(`INSERT INTO sakan_catalog_products
        (id,supplier_id,name,description,image_url,images,supplier_price,retail_price,currency,category,subcategory,tags,supplier_category,stock,active,updated_at)
        VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,TRUE,NOW())
        ON CONFLICT (supplier_id) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,
        image_url=EXCLUDED.image_url,images=EXCLUDED.images,supplier_price=EXCLUDED.supplier_price,
        retail_price=EXCLUDED.retail_price,currency=EXCLUDED.currency,category=EXCLUDED.category,
        subcategory=EXCLUDED.subcategory,tags=EXCLUDED.tags,supplier_category=EXCLUDED.supplier_category,
        stock=EXCLUDED.stock,active=TRUE,updated_at=NOW()`,
        [p.id,p.supplierId,p.name,p.description,p.imageUrl,JSON.stringify(p.images),p.supplierPrice,p.retailPrice,p.currency,p.category,p.subcategory,JSON.stringify(p.tags),p.supplierCategory,p.stock]);
      count++;
    }
    await client.query("COMMIT"); return count;
  } catch(error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
