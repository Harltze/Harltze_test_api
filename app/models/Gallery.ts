import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";


const gallerySchema = new Schema({
    pictureURL: {
        type: Array,
        required: true,
    },
    title: {
        type: String,
        default: null,
    },
    description: {
        type: String,
        default: null,
    }
}, {timestamps: true});

type galleryCollectionType = InferSchemaType<typeof gallerySchema>;

gallerySchema.plugin(paginate);

const   galleryCollection = model<galleryCollectionType, PaginateModel<galleryCollectionType>>("gallery", gallerySchema);

export {galleryCollection, galleryCollectionType};
