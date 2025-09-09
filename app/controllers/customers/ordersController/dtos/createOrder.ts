import { productCollectionType } from "../../../../models/Products";

interface Product {
    product: productCollectionType;
    quantity: number;
    totalQuantityCost: number;
}

export interface CreateOrderInterface {
    shopId: string;
    products: Product[];
    customerId: string;
    totalCost: number;
    hungryFee: number;
    country: string;
    state: string;
    city: string;
    address: string;
    latitude?: string;
    longitude?: string;
    paystackRefernce: string;
    codeDetails: any;
}