import type { StockProduct } from './StockProduct'

/**
 * Port (DIP): stock-movements depends on this abstraction, never on Axios.
 * Swappable catalog source (OCP) without changing use cases or UI.
 */
export interface IProductCatalog {
  findAll(): Promise<StockProduct[]>
  findById(id: string): Promise<StockProduct>
}
