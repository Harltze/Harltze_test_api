import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";

const currencyEnum = ["gbp", "usd", "eur", "ngn"];

const productSchema = new Schema({
    // pictures: {
    //     type: Array,
    //     required: true
    // },
    stockStatus: {
        type: String,
        enum: ["in-stock", "out-of-stock", "archived"],
        default: "in-stock"
    },
    cost: {
        type: Number,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    averageRating: {
        type: Number,
        default: 0
    },
    forType: {
        type: Array,
        default: []
    },
    sizeAndColor: {
        type: [
            {
                color: String,
                colorCode: String,
                sizes: {
                    type: [
                        {
                            size: {
                                type: String,
                                required: true
                            },
                            quantityAvailable: {
                                type: Number,
                                required: true
                            },
                            sku: {
                                type: String,
                                required: true
                            }
                        }
                    ]
                },
                pictures: Array
            }
        ],
        default: []
    },
    customerProductType: {
        type: Array,
        default: []
    },
    categories: {
        type: [
            {type: Schema.Types.ObjectId, ref: "categories"}
        ],
        required: true
    },
    clothesCollections: {
        type: [
            {type: Schema.Types.ObjectId, ref: "clothescollections"}
        ],
        default: []
    },
    productStatus: {
        type: String,
        enum: ["draft", "in-review", "published"],
        required: true
    },
    totalRequiredCravings: {
        type: Number,
        default: 0
    },
    reviewsAndRating: {
        type: Array,
        default: []
    },
    sizeChart: {
        type: [
            {
               title: String,
               xs: String, 
               s: String, 
               m: String, 
               l: String,
               xl: String,
               xxl: String,
            }
        ]
    }
}, {timestamps: true});

type productCollectionType = InferSchemaType<typeof productSchema>;

productSchema.plugin(paginate);

const   productCollection = model<productCollectionType, PaginateModel<productCollectionType>>("products", productSchema);

export {productCollection, productCollectionType};
