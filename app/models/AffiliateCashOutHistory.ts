import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";


const affiliateCashOutHistorySchema = new Schema({
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "shops",
      required: true,
    },
    ordersCashedOutOn: {
        type: [
            {type: Schema.Types.ObjectId, ref: "orders"}
        ],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    },
    amountCashedOut: {
        type: Number,
        required: true
    }
}, {timestamps: true});

type affiliateCashOutHistoryCollectionType = InferSchemaType<typeof affiliateCashOutHistorySchema>;

affiliateCashOutHistorySchema.plugin(paginate);

const affiliateCashOutHistoryCollection = model<affiliateCashOutHistoryCollectionType, PaginateModel<affiliateCashOutHistoryCollectionType>>("affiliateCashOutHistorys", affiliateCashOutHistorySchema);

export {affiliateCashOutHistoryCollection, affiliateCashOutHistoryCollectionType};
