/**
 * SAKAN EUROPE supplier-cost pricing.
 * Applies a 75% markup and rounds upward to a .99 EUR retail price,
 * so the displayed price never falls below the calculated target.
 */
export function calculateSakanPrice(supplierPriceEUR: number): {
  costPrice: number;
  retailPrice: number;
  marginEUR: number;
} {
  if (!Number.isFinite(supplierPriceEUR) || supplierPriceEUR < 0) {
    throw new Error("Ungültiger Einkaufspreis");
  }

  const costPrice = Number(supplierPriceEUR.toFixed(2));
  const rawRetailPrice = costPrice * 1.75;
  const finalRetailPrice = Math.ceil(rawRetailPrice) - 0.01;
  const retailPrice = Number(finalRetailPrice.toFixed(2));

  return {
    costPrice,
    retailPrice,
    marginEUR: Number((retailPrice - costPrice).toFixed(2)),
  };
}
