import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";


const feedbackSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "customers",
        required: true,
    },
    feedback: {
        type: String,
        required: true
    }
}, {timestamps: true});

type feedbackCollectionType = InferSchemaType<typeof feedbackSchema>;

feedbackSchema.plugin(paginate);

const feedbackCollection = model<feedbackCollectionType, PaginateModel<feedbackCollectionType>>("feedbacks", feedbackSchema);

export {feedbackCollection, feedbackCollectionType};
