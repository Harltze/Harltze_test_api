import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { customerCollection } from "../../../models/Customers";
import { productCollection } from "../../../models/Products";
import { shopCollection } from "../../../models/Shops";

export const getShopsNearby = async (
  userId: string,
  page = 1,
  limit = 20
): Promise<ControllerResponseInterface> => {
  try {
    const query: any = {};

    const userDetails = await customerCollection.findById(userId);

    query.country = userDetails?.country;

    const shops = await shopCollection.paginate(query, {
      page,
      limit,
    });

    return {
      result: shops,
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

export const getShopById = async (
  shopId: string
): Promise<ControllerResponseInterface> => {
  try {
    const shopDetails = await shopCollection.findById(shopId);

    const shopCategories = await productCollection
      .distinct("categories", { shopId })
      .populate("categories");

    const products = await productCollection.find({ shopId });

    return {
      result: { shopDetails, shopCategories, products },
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

export const searchShop = async (
  searchWord: string,
  userId: string
): Promise<ControllerResponseInterface> => {
  try {
    const userDetails = await customerCollection.findById(userId);

    const searchResult = await shopCollection
      .find({
        shopName: { $regex: new RegExp(searchWord, "i") },
        country: userDetails?.country,
      })
      .limit(50);

    return {
      result: searchResult,
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
