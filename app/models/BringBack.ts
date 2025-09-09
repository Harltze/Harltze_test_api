import { Schema, InferSchemaType, model, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

const bringBackSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "customers",
      required: true,
    },
    categories: {
      type: [{ type: Schema.Types.ObjectId, ref: "categories" }],
      required: true,
    },
    clothesCollections: {
      type: [{ type: Schema.Types.ObjectId, ref: "clothescollections" }],
    },
    color: {
      type: String,
      required: true,
    },
    colorCode: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

type bringBackCollectionType = InferSchemaType<typeof bringBackSchema>;

bringBackSchema.plugin(paginate);

const bringBackCollection = model<
  bringBackCollectionType,
  PaginateModel<bringBackCollectionType>
>("bringBacks", bringBackSchema);

export { bringBackCollection, bringBackCollectionType };
