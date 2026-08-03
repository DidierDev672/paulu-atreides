import type { StockProduct } from '../domain/StockProduct'

/**
 * Pure helper (SRP): builds an id → product map for O(1) lookups in the UI.
 */
export function indexProductsById(products: StockProduct[]): Record<string, StockProduct> {
  return products.reduce<Record<string, StockProduct>>((acc, product) => {
    acc[product.id] = product
    return acc
  }, {})
}
