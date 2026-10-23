/**
 * SAKAN EUROPE retail pricing: 75% markup with a luxury .99 EUR ending.
 */
export function calculateSakanPrice(supplierPriceEUR: number): number {
  if (!Number.isFinite(supplierPriceEUR) || supplierPriceEUR <= 0) return 0;
  const rawRetail = supplierPriceEUR * 1.75;
  return Number((Math.floor(rawRetail) + 0.99).toFixed(2));
}

export function calculateSakanPriceDetails(supplierPriceEUR: number): {
  costPrice: number;
  retailPrice: number;
  marginEUR: number;
} {
  const retailPrice = calculateSakanPrice(supplierPriceEUR);
  const costPrice = Number(supplierPriceEUR.toFixed(2));
  return {
    costPrice,
    retailPrice,
    marginEUR: Number((retailPrice - costPrice).toFixed(2)),
  };
}
