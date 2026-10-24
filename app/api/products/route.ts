import { NextResponse } from "next/server";
import { listCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await listCatalogProducts();
    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error("Catalog read failed:", error);
    return NextResponse.json(
      { success: false, message: "Catalog is not configured. Check DATABASE_URL." },
      { status: 503 }
    );
  }
}
