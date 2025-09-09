import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";


const productReviewSchema = new Schema({
    shopId: {
        type: Schema.Types.ObjectId,
        ref: "shops",
        required: true,
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: "products",
        required: true,
    },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: "customers",
        required: true,
    },
    rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true
    },
    description: {
        type: String,
        default: ""
    }
}, {timestamps: true});

type productReviewCollectionType = InferSchemaType<typeof productReviewSchema>;

productReviewSchema.plugin(paginate);

const   productReviewCollection = model<productReviewCollectionType, PaginateModel<productReviewCollectionType>>("productreviews", productReviewSchema);

export {productReviewCollection, productReviewCollectionType};
