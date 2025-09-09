import mongoose, {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";

const clothesSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["product", "studio"],
        required: true
    },
    slug: {
        type: String,
        required: true
    }
}, {timestamps: true});

type clothesCollectionType = InferSchemaType<typeof clothesSchema>;

clothesSchema.plugin(paginate);

const clothesCollection = model<clothesCollectionType, PaginateModel<clothesCollectionType>>("clothescollections", clothesSchema);

export {clothesCollection, clothesCollectionType};