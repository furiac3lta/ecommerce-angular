export interface ProductVariant {
  id?: number;
  productId: number;
  size: string;
  color: string;
  gsm?: number;
  material?: string;
  usage?: string;
  sku?: string;
  stockCurrent?: number;
  stockMinimum?: number;
  active?: boolean;
  reservedStock?: number;
  availableStock?: number;
}
