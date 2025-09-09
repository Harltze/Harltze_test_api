import {Schema, InferSchemaType, model} from "mongoose";
import { v4 } from "uuid";

const customerSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    userUniqueId: {
        type: String,
        default: v4()
    },
    phoneNumber: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    secondaryEmail: {
        type: String,
        default: "",
        required: false
    },
    secondaryEmailVerified: {
        type: Boolean,
        default: false,
    },
    phoneNumberVerified: {
        type: Boolean,
        default: false
    },
    loginType: {
        type: String,
        enum: ["credentials", "google", "facebook"],
        default: "credentials"
    },
    profilePic: {
        type: String,
        default: ""
    },
    country: {
        type: String,
        default: "Nigeria"
    },
    password: {
        type: String,
    },
    providerId: {
        type: String
    },
    accountDetails: {
        type: Object,
        default: null
    },
    tempId: {
        type: String,
        default: null
    }
}, {timestamps: true});

type customerCollectionType = InferSchemaType<typeof customerSchema>;

const customerCollection = model("customers", customerSchema);

export {customerCollection, customerCollectionType};