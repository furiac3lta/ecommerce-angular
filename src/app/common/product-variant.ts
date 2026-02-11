export interface ProductVariant {
  id?: number;
  productId: number;
  size: string;
  color: string;
  gsm?: number;
  material?: string;
  usage?: string;
  sku?: string;
  priceRetail?: number;
  priceWholesale?: number;
  deliveryType?: 'IMMEDIATE' | 'DELAYED';
  estimatedDeliveryDays?: number;
  estimatedDeliveryDate?: string;
  deliveryNote?: string;
  stockCurrent?: number;
  stockMinimum?: number;
  active?: boolean;
  sellOnline?: boolean;
  reservedStock?: number;
  availableStock?: number;
}
