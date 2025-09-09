import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";


const orderSchema = new Schema({
    shopDeleted: {
        type: Boolean,
        default: false
    },
    customerQrCode: {
        type: String
    },
    shopQrCode: {
        type: String
    },
    riderQrCode: {
        type: String
    },
    products: {
        type: Array,
        required: true,
    },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: "customers",
        required: true,
    },
    customerDeleted: {
        type: Boolean,
        default: false
    },
    totalCost: {
        type: Number,
        required: true
    },
    shippingFee: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5],
        default: 0
    },
    codeType: {
        type: String,
        enum: ["discount", "affiliate"],
        default: null
    },
    code: {
        type: String,
        default: null
    },
    discountPercentApplied: {
        type: Number,
        default: 0
    },
    discountedAmount: {
        type: Number,
        default: 0
    },
    affiliateId: {
        type: Schema.Types.ObjectId,
        ref: "shops",
        default: null
    },
    affiliatePercentApplied: {
        type: Number,
        default: 0
    },
    affiliateGets: {
        type: Number,
        default: 0
    },
    affiliateComissionPaymentStatus: {
        type: String,
        enum: ["pending", "cashed-out", "paid"],
        default: "pending"
    },
    companyGets: {
        type: Number,
        default: 0
    },
    comment: {
        type: String,
        default: ""
    },
    orderStatus: {
        type: String,
        enum: ["pending", "shipping-fee-updated", "paid", "payment-failed", "cancelled", "timed-out", "completed"],
        default: "pending"
    },
    shippingStatus: {
        type: Number,
        default: 0
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
    },
    latitude: {
        type: String,
        default: ""
    },
    longitude: {
        type: String,
        default: ""
    },
    paystackReference: {
        type: String,
        default: ""
    }
}, {timestamps: true});

type orderCollectionType = InferSchemaType<typeof orderSchema>;

orderSchema.plugin(paginate);

const orderCollection = model<orderCollectionType, PaginateModel<orderCollectionType>>("orders", orderSchema);

export {orderCollection, orderCollectionType};
