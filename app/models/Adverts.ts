import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";


const advertsSchema = new Schema({
    shopId: {
        type: Schema.Types.ObjectId,
        ref: "shops",
        null: true,
        default: null,
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: "products",
        null: true,
        default: null,
    },
    advertType: {
        type: String,
        enum: ["internal", "external"],
        required: true
    },

    // To be used for external adverts
    picture: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: ""
    },
    writeup: {
        type: String,
        default: ""
    },
    url: {
        type: String,
        default: ""
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    // External adverts field ends here

    amountPaidForAd: {
        type: Number,
        required: true
    },
    states: {
        type: Array,
        default: []
    }
}, {timestamps: true});

type advertsCollectionType = InferSchemaType<typeof advertsSchema>;

advertsSchema.plugin(paginate);

const advertsCollection = model<advertsCollectionType, PaginateModel<advertsCollectionType>>("adverts", advertsSchema);

export {advertsCollection, advertsCollectionType};
