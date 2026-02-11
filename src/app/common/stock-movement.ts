export type StockMovementType = 'IN' | 'OUT' | 'ADJUST';

export type StockMovementReason =
  | 'SALE'
  | 'SALE_ONLINE'
  | 'SALE_WHOLESALE'
  | 'SALE_OFFLINE'
  | 'EXCHANGE_IN'
  | 'EXCHANGE_OUT'
  | 'ADJUST'
  | 'MANUAL_ADJUST'
  | 'RESTOCK'
  | 'CANCEL'
  | 'CORRECTION'
  | 'RETURN'
  | 'OTHER';

export interface StockMovement {
  id?: number;
  variantId: number;
  type: StockMovementType;
  qty: number;
  reason: StockMovementReason;
  orderId?: number;
  saleChannel?: 'ONLINE' | 'WHOLESALE' | 'OFFLINE';
  unitPrice?: number;
  note?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface StockMovementRequest {
  variantId: number;
  qty: number;
  type: StockMovementType;
  reason: StockMovementReason;
  note: string;
  createdBy: string;
}
