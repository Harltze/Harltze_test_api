import {Schema, InferSchemaType, model} from "mongoose";
import { v4 } from "uuid";

const shippingAddressSchema = new Schema({
    customerId: {
        type: Schema.Types.ObjectId,
        ref: "customers",
        required: true
    },
    country: {
        type: String,
        default: "Nigeria"
    },
    state: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    }
}, {timestamps: true});

type shippingAddressCollectionType = InferSchemaType<typeof shippingAddressSchema>;

const shippingAddressCollection = model("shippingAddresss", shippingAddressSchema);

export {shippingAddressCollection, shippingAddressCollectionType};