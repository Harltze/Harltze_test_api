import {Schema, InferSchemaType, model} from "mongoose";

const SMS_OTPSchema = new Schema({
    userId: {
        type:Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    uId: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    }
}, {timestamps: true});

type SMSOTPCollectionType = InferSchemaType<typeof SMS_OTPSchema>;

const SMSOTPCollection = model("SMSOTPs", SMS_OTPSchema);

export {SMSOTPCollection, SMSOTPCollectionType};