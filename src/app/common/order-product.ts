export class OrderProduct {
    constructor(public id: number | null, public productId: number, public quantity: number, public price: number,public productName?: string) {}

    get totalItem(): number {
        return this.price * this.quantity;
    }
}
