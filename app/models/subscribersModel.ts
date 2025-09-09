import { Schema, InferSchemaType, model, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

const currencyEnum = ["gbp", "usd", "eur", "ngn"];

const subscribersSchema = new Schema(
  {
    subscribersName: {
      type: String,
      required: true,
    },
    subscribersEmail: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

type subscribersCollectionType = InferSchemaType<typeof subscribersSchema>;

subscribersSchema.plugin(paginate);

const subscribersCollection = model<
  subscribersCollectionType,
  PaginateModel<subscribersCollectionType>
>("subscribers", subscribersSchema);

export { subscribersCollection, subscribersCollectionType };
