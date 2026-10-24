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
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Serialize first-time schema setup across concurrent serverless invocations.
    await client.query("SELECT pg_advisory_xact_lock(714928462023)");
    await client.query(`CREATE TABLE IF NOT EXISTS sakan_products (
      id VARCHAR(255) PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      price NUMERIC(10, 2) NOT NULL,
      category VARCHAR(255),
      subcategory VARCHAR(255),
      tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      supplier VARCHAR(255),
      supplier_product_id VARCHAR(255),
      supplier_price NUMERIC(12,2),
      retail_price NUMERIC(12,2),
      currency VARCHAR(10) NOT NULL DEFAULT 'USD',
      supplier_category TEXT NOT NULL DEFAULT '',
      stock INTEGER,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    await client.query("ALTER TABLE sakan_products ADD COLUMN IF NOT EXISTS supplier VARCHAR(255)");
    await client.query("ALTER TABLE sakan_products ADD COLUMN IF NOT EXISTS sku VARCHAR(255)");
    await client.query("ALTER TABLE sakan_products ADD COLUMN IF NOT EXISTS supplier_product_id VARCHAR(255)");
    await client.query("ALTER TABLE sakan_products ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()");
    await client.query("ALTER TABLE sakan_products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()");
    await client.query("ALTER TABLE sakan_products ADD COLUMN IF NOT EXISTS subcategory VARCHAR(255)");
    await client.query("ALTER TABLE sakan_products ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]");
    await client.query("ALTER TABLE sakan_products ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]");
    await client.query("ALTER TABLE sakan_products ADD COLUMN IF NOT EXISTS supplier_price NUMERIC(12,2)");
    await client.query("ALTER TABLE sakan_products ADD COLUMN IF NOT EXISTS retail_price NUMERIC(12,2)");
    await client.query("ALTER TABLE sakan_products ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'USD'");
    await client.query("ALTER TABLE sakan_products ADD COLUMN IF NOT EXISTS supplier_category TEXT NOT NULL DEFAULT ''");
    await client.query("ALTER TABLE sakan_products ADD COLUMN IF NOT EXISTS stock INTEGER");
    await client.query("ALTER TABLE sakan_products ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE");
    await client.query("ALTER TABLE sakan_products ADD COLUMN IF NOT EXISTS sync_status VARCHAR(50) DEFAULT 'synced'");
    await client.query("ALTER TABLE sakan_products ADD COLUMN IF NOT EXISTS sync_error TEXT");
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
export async function getCatalogSyncPage(): Promise<number> {
  const pool = getPool();
  await pool.query(`CREATE TABLE IF NOT EXISTS sakan_catalog_sync_state (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    next_page INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  const { rows } = await pool.query(
    "INSERT INTO sakan_catalog_sync_state (id, next_page) VALUES (1, 1) ON CONFLICT (id) DO UPDATE SET id = EXCLUDED.id RETURNING next_page"
  );
  return Math.max(1, Number(rows[0]?.next_page) || 1);
}
export async function setCatalogSyncPage(nextPage: number): Promise<void> {
  const pool = getPool();
  await pool.query(`CREATE TABLE IF NOT EXISTS sakan_catalog_sync_state (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    next_page INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query(
    "INSERT INTO sakan_catalog_sync_state (id, next_page, updated_at) VALUES (1, $1, NOW()) ON CONFLICT (id) DO UPDATE SET next_page = EXCLUDED.next_page, updated_at = NOW()",
    [Math.max(1, Math.trunc(nextPage))]
  );
}
export async function existingSupplierIds():Promise<Set<string>> {
  await ensureCatalogTable();
  const {rows}=await getPool().query("SELECT supplier_product_id FROM sakan_products WHERE supplier_product_id IS NOT NULL");
  return new Set<string>(rows.map((row:{supplier_product_id:string})=>row.supplier_product_id));
}
export async function listCatalogProducts() {
  await ensureCatalogTable();
  const {rows}=await getPool().query(`SELECT id,supplier_product_id AS "supplierId",title AS name,
    COALESCE(description,'') AS description,
    COALESCE(images[1],'') AS "imageUrl",images,
    COALESCE(supplier_price,price) AS "supplierPrice",COALESCE(retail_price,price) AS "retailPrice",
    COALESCE(currency,'USD') AS currency,category,subcategory,tags,
    COALESCE(supplier_category,'') AS "supplierCategory",stock,updated_at AS "updatedAt"
    FROM sakan_products WHERE active=TRUE ORDER BY category,title LIMIT 2000`);
  return rows.map((row: any) => ({...row, images: row.images ?? [], tags: row.tags ?? []})) as CatalogProduct[];
}
export async function upsertCatalogProducts(products:Array<Omit<CatalogProduct,"updatedAt">>, options:{insertOnly?:boolean}={}) {
  await ensureCatalogTable(); const pool=getPool(); const client=await pool.connect(); let count=0;
  try {
    await client.query("BEGIN");
    for (const p of products) {
      const conflictAction = options.insertOnly ? "ON CONFLICT (supplier_product_id) DO NOTHING" : `ON CONFLICT (supplier_product_id) DO UPDATE SET
        title=EXCLUDED.title,description=EXCLUDED.description,price=EXCLUDED.price,category=EXCLUDED.category,
        subcategory=EXCLUDED.subcategory,tags=EXCLUDED.tags,images=EXCLUDED.images,supplier=EXCLUDED.supplier,
        supplier_price=EXCLUDED.supplier_price,retail_price=EXCLUDED.retail_price,currency=EXCLUDED.currency,
        supplier_category=EXCLUDED.supplier_category,stock=EXCLUDED.stock,active=TRUE,synced_at=NOW(),updated_at=NOW()`;
      const result=await client.query(`INSERT INTO sakan_products
        (id,supplier_product_id,title,description,price,category,subcategory,tags,images,supplier,supplier_price,retail_price,currency,supplier_category,stock,active,synced_at,created_at,updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8::text[],$9::text[],$10,$11,$12,$13,$14,$15,TRUE,NOW(),NOW(),NOW()) ${conflictAction}`,
        [p.id,p.supplierId,p.name,p.description,p.retailPrice,p.category,p.subcategory,p.tags,p.images,"CJ Dropshipping",p.supplierPrice,p.retailPrice,p.currency,p.supplierCategory,p.stock]);
      count += result.rowCount ?? 0;
    }
    if (options.insertOnly && count !== products.length) {
      throw new Error(`Expected ${products.length} new products but inserted ${count}; transaction rolled back to preserve the exact batch size.`);
    }
    await client.query("COMMIT"); return count;
  } catch(error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
