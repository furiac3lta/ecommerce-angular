export interface Product {
    id: number;
    name: string;
    code: string;
    description: string;
    urlImage: string;
    publicId: string;
    price: number;
    dateCreated: Date;
    dateUpdated: Date;
    userId: number;
    categoryId: number;
}