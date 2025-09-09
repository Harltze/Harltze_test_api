import mongoose, {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";
import { v4 } from "uuid";

const mealCategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    clotheCollection: {
        type: mongoose.Types.ObjectId,
        ref: "clothescollections",
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

type mealCategoryCollectionType = InferSchemaType<typeof mealCategorySchema>;

mealCategorySchema.plugin(paginate);

const mealCategoryCollection = model<mealCategoryCollectionType, PaginateModel<mealCategoryCollectionType>>("categories", mealCategorySchema);

export {mealCategoryCollection, mealCategoryCollectionType};