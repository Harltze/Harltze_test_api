import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";

const deletedSchema = new Schema({
    deletedDataType: {
        type: String,
        enum: ["shop", "customer"],
        required: true
    },
    deletedObject: {
        type: Object,
        required: true
    }
}, {timestamps: true});

type deletedCollectionType = InferSchemaType<typeof deletedSchema>;

deletedSchema.plugin(paginate);

const deletedCollection = model<deletedCollectionType, PaginateModel<deletedCollectionType>>("deleteds", deletedSchema);

export {deletedCollection, deletedCollectionType};