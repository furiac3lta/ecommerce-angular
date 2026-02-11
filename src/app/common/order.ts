/* import { OrderProduct } from "./order-product";
import { OrderState } from "./order-state";

export class Order {

    constructor(public id:number|null, public dateCreated:Date, public orderProducts:OrderProduct[], public userId:number, public orderState:OrderState){}

    getTotal(){
        let total = 0;
        for(let orderProduct of this.orderProducts){
            total += orderProduct.price * orderProduct.quantity;
            console.log('Total: ' + total);
        }
    }

}
 */
import { OrderProduct } from "./order-product";
import { OrderState } from "./order-state";
import { SaleChannel } from "./sale-channel";

export class Order {
    public totalOrderPrice: number; // Agregar la propiedad
    public userName?: string;  // ➜ Agregar el nombre del usuario
    public userEmail?: string; // ➜ Agregar el email del usuario
    public userPhone?: string;
    public paymentMethod?: string;
    public paidAt?: Date;
    public total?: number;
    public saleChannel?: SaleChannel;
    public orderNumber?: string;
    public deliveryType?: 'IMMEDIATE' | 'DELAYED';
    public estimatedDeliveryDate?: string;
    public actualDeliveryDate?: string;
    public balanceDue?: number;
    public balanceCredit?: number;
    
    constructor(
        public id: number | null,
        public dateCreated: Date,
        public orderProducts: OrderProduct[],
        public userId: number,
        public orderState: OrderState,
        saleChannel?: SaleChannel,
        orderNumber?: string
    ) {
        this.totalOrderPrice = this.calculateTotal(); // Calcular el total al instanciar
        this.paymentMethod = 'TRANSFERENCIA';
        this.saleChannel = saleChannel;
        this.orderNumber = orderNumber;
    }

    private calculateTotal(): number {
        return this.orderProducts.reduce((total, orderProduct) => total + (orderProduct.price * orderProduct.quantity), 0);
    }
}
