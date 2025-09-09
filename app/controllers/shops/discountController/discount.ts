import { discountsCollection } from "../../../models/DiscountModel"

export async function createDiscount(
    discountCode: string,
    discountAmountOrPercent: number,
    discountForProductsAbove: number,
    expiryDate: Date | null
) {
    try {

        const discountCodeAlreadyExists = await discountsCollection.findOne({discountCode});
        
        if(discountCodeAlreadyExists) {
            return {
                status: 409,
                result: "Discount code already exists"
            }
        }

        const newDiscountCode = await discountsCollection.create({
            discountCode,
            discountAmountOrPercent,
            discountForProductsAbove: discountForProductsAbove * 100,
            expiryDate
        });
    
        return {
            status: 201,
            result: newDiscountCode
        }
    } catch (error) {
        console.log(error);
        return {
            status: 500,
            result: null
        }
    }
}

export async function discountCodes() {
    const discountCodes = await discountsCollection.find();
    return {
        status: 200,
        result: discountCodes
    }
}