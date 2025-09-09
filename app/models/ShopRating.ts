import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";


const shopRatingSchema = new Schema({
    shopId: {
        type: Schema.Types.ObjectId,
        ref: "shops",
        required: true,
    },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: "customers",
        required: true,
    },
    quantity: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true
    },
    comment: {
        type: String,
        default: ""
    },
}, {timestamps: true});

type shopRatingCollectionType = InferSchemaType<typeof shopRatingSchema>;

shopRatingSchema.plugin(paginate);

const   shopRatingCollection = model<shopRatingCollectionType, PaginateModel<shopRatingCollectionType>>("shopRatings", shopRatingSchema);

export {shopRatingCollection, shopRatingCollectionType};
