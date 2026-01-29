export class ItemCart {
  constructor(
    public productVariantId: number,
    public productId: number,
    public productName: string,
    public quantity: number,
    public price: number,
    public size?: string,
    public color?: string,
    public imageUrl?: string
  ) {}

  getTotalPriceItem() {
    return this.quantity * this.price;
  }
}
