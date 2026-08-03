import type { IProductCatalog } from '../domain/IProductCatalog'
import type { StockProduct } from '../domain/StockProduct'

/**
 * Use case (SRP): load one product by id from the catalog port.
 */
export async function getProductById(
  catalog: IProductCatalog,
  id: string,
): Promise<StockProduct> {
  return catalog.findById(id)
}
