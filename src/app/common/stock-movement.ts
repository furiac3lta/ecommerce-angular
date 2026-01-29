export type StockMovementType = 'IN' | 'OUT' | 'ADJUST';

export type StockMovementReason =
  | 'SALE'
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
