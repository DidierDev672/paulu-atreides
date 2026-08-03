import type { IProductCatalog } from '../domain/IProductCatalog'
import type { StockProduct } from '../domain/StockProduct'

/**
 * Use case (SRP): load the full product catalog for enriching stock movements.
 */
export async function getProductCatalog(catalog: IProductCatalog): Promise<StockProduct[]> {
  return catalog.findAll()
}
