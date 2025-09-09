import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";

const currencyEnum = ["gbp", "usd", "eur", "ngn"];

const transactionSchema = new Schema({
    transactionType: {
        type: String,
        enum: ["short-let-payment", "rent-payment", "inspection-payment",  "others"],
        required: true,
    },
    paystackObject: {
        type: Object,
        required: true
    },
    transactionResponseStatus: {
        type: Number,
        required: true
    }
}, {timestamps: true});

type transactionCollectionType = InferSchemaType<typeof transactionSchema>;

transactionSchema.plugin(paginate);

const   transactionCollection = model<transactionCollectionType, PaginateModel<transactionCollectionType>>("transactions", transactionSchema);

export {transactionCollection, transactionCollectionType};
