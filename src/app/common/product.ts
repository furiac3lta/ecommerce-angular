export class Product {
    constructor(
        public id:number,
        public name:string,
        public code:string,
        public description:string,
        public price:number,
        public priceOverride: boolean = false,
        public sellOnline: boolean = true,
        public urlImage:string,
        public image:File,
        public userId:string,
        public categoryId:string,
        public deliveryType: 'IMMEDIATE' | 'DELAYED' = 'IMMEDIATE',
        public estimatedDeliveryDays?: number,
        public estimatedDeliveryDate?: string,
        public deliveryNote?: string,
        public images?: string[]
    ){}
}
