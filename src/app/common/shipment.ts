export type ShipmentStatus = 'CREATED' | 'SHIPPED' | 'DELIVERED';

export interface Shipment {
  id?: number;
  orderId: number;
  carrier: string;
  trackingNumber: string;
  shippingMethod: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  notes?: string;
  status?: ShipmentStatus;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}
