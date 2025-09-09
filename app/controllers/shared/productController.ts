import mongoose from "mongoose";
import { ControllerResponseInterface } from "../../interfaces/responseInterface";
import { productCollection } from "../../models/Products";
import { bringBackCollection } from "../../models/BringBack";

export const getShopProducts = async (
  query: string,
  category: string,
  productOrStudio: string,
  isAdmin: boolean,
  page: number = 1,
  limit: number = 20,
  clothesCollections: string,
): Promise<ControllerResponseInterface> => {
  try {

    const q: any = {};

    if(category && category != 'all') q.categories = new mongoose.Types.ObjectId(category);

    if(query && query.length > 1) q.productName = {$regex: query, $options: 'i'};

    if(clothesCollections && clothesCollections != "all") q.clothesCollections = new mongoose.Types.ObjectId(clothesCollections);

    if(productOrStudio == "product") {
      q.stockStatus = {$ne: "archived"};
    } else if(productOrStudio == "studio") {
      q.stockStatus = "archived";
    }

    if(isAdmin == false) {
      q.productStatus == "published";
    }

    console.log("Query", q);

    const products = await productCollection.paginate(
      q,
      {
        populate: [
          {
            path: "categories",
            select: "name slug"
          },
          {
            path: "clothesCollections",
            select: "name slug"
          }
        ],
        page,
        limit,
        sort: {updatedAt: -1}
      }
    );

    return {
      result: products,
      status: 200,
    };
  } catch (error: any) {
    console.log(error);
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
};


export const shopViewProductById = async (
    productId: string
  ) => {
    try {
      const productDetails = await productCollection.findById(productId).populate("categories").populate("clothesCollections");
  
      const cravingsCount = await bringBackCollection.countDocuments({productId});

      const similarProducts = await productCollection.find({
        _id: {$ne: productDetails?._id},
        categories: {$in: productDetails?.categories},
        stockStatus: {$ne: "archived"},
        productStatus: "published"
      });

      if (!productDetails) {
        return {
          result: "Product not found",
          status: 404,
        };
      }
  
      return {
        result: productDetails,
        cravingsCount,
        similarProducts,
        status: 200,
      };
    } catch (error: any) {
      return {
        result: null,
        status: error.status || 500,
        error,
      };
    }
  };
