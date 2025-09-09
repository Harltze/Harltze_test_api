import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";


const orderBackupSchema = new Schema({
    shop: {
        type: Object,
        required: true,
    },
    customer: {
        type: Object,
        required: true,
    },
    orderId: {
        type: Schema.Types.ObjectId,
        ref: "orders",
        required: true,
    },
    order: {
        type: Object,
        required: true
    }
}, {timestamps: true});

type orderBackupCollectionType = InferSchemaType<typeof orderBackupSchema>;

orderBackupSchema.plugin(paginate);

const orderBackupCollection = model<orderBackupCollectionType, PaginateModel<orderBackupCollectionType>>("orderbackups", orderBackupSchema);

export {orderBackupCollection, orderBackupCollectionType};
