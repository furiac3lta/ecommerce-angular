export class OrderProduct {
    constructor(
        public id: number | null,
        public productVariantId: number,
        public quantity: number,
        public price: number,
        public productName?: string,
        public size?: string,
        public color?: string,
        public deliveryType?: 'IMMEDIATE' | 'DELAYED',
        public estimatedDeliveryDate?: string,
        public deliveryNote?: string
    ) {}

    get totalItem(): number {
        return this.price * this.quantity;
    }
}
