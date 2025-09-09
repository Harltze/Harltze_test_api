import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";

const currencyEnum = ["gbp", "usd", "eur", "ngn"];

const discountschema = new Schema({
    discountCode: {
        type: String,
        required: true
    },
    discountType: {
        type: String,
        // enum: ["percent", "amount"],
        default: "percent",
        required: true
    },
    discountAmountOrPercent: {
        type: Number,
        required: true
    },
    discountForProductsAbove: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Date,
        default: null
    }
}, {timestamps: true});

type discountsCollectionType = InferSchemaType<typeof discountschema>;

discountschema.plugin(paginate);

const discountsCollection = model<discountsCollectionType, PaginateModel<discountsCollectionType>>("discounts", discountschema);

export {discountsCollection, discountsCollectionType};
