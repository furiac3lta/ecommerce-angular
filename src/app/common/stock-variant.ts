export interface StockVariant {
  id: number;
  productId: number;
  productName?: string;
  size?: string;
  color?: string;
  gsm?: number;
  sku?: string;
  stockCurrent?: number;
  stockMinimum?: number;
  reservedStock?: number;
  availableStock?: number;
  active?: boolean;
}
