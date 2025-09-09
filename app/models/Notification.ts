import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";


const notificationsSchema = new Schema({
    // Values could be userIds (maybe of two or more users to see the notifications),
    // could be 'all' or 'shops' or 'customers'
    userType: {
        type: Array,
        required: true,
    },
    // Icon name that should show when this notification shows up
    iconName: {
        type: Array,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    writeup: {
        type: String,
        required: true,
    },
    // Holds the ID of the field concerned with the notification in case it 
    extraField: {
        type: String
    },
    status: {
        type: String
    },
    // Where to route the user to if he clicks on the notification
    routeTo: {
        type: String,
        required: true
    }
}, {timestamps: true});

type notificationsCollectionType = InferSchemaType<typeof notificationsSchema>;

notificationsSchema.plugin(paginate);

const   notificationsCollection = model<notificationsCollectionType, PaginateModel<notificationsCollectionType>>("notifications", notificationsSchema);

export {notificationsCollection, notificationsCollectionType};
