export interface Product {
    id: number;
    name: string;
    code: string;
    description: string;
    urlImage: string;
    publicId: string;
    images?: string[];
    price: number;
    priceOverride?: boolean;
    sellOnline?: boolean;
    deliveryType?: 'IMMEDIATE' | 'DELAYED';
    estimatedDeliveryDays?: number;
    estimatedDeliveryDate?: string;
    deliveryNote?: string;
    dateCreated: Date;
    dateUpdated: Date;
    userId: number;
    categoryId: number;
}
