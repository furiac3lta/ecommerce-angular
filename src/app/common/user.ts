export class User {
    constructor(public id:number, 
        public username:string,
        public firstName:string, 
        public lastName:string, 
        public email:string, 
        public address:string,
        public cellphone:string,
        public password:string,
        public userType:string,
        public isWholesale: boolean = false,
        public wholesaleDiscount?: number,
        public wholesalePriceList?: string
    ){

    }
}
