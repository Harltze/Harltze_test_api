import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";

const currencyEnum = ["gbp", "usd", "eur", "ngn"];

const propertyOrderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    property: {
        type: Object,
        required: true
    },
    amountPaid: {
        type: String,
        required: true
    },
    paystackReference: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required:  true
    },
    viewingDate: {
        type: Date,
        required: false
    },
    checkInDate: {
        type: Date,
        required: false
    },
    checkOutDate: {
        type: Date,
        required: false
    },
    numberOfGuests: {
        type: Number,
        required: false
    },
    stayDuration: {
        type: Number,
        required: false
    },
    status: {
        type: String,
        enum: ["success", "cancelled", "pending", "rejected"],
        default: "pending"
    }
}, {timestamps: true});

type propertyOrderCollectionType = InferSchemaType<typeof propertyOrderSchema>;

propertyOrderSchema.plugin(paginate);

const   propertyOrderCollection = model<propertyOrderCollectionType, PaginateModel<propertyOrderCollectionType>>("propertyOrders", propertyOrderSchema);

export {propertyOrderCollection, propertyOrderCollectionType};
