import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { customerCollection } from "../../../models/Customers";
import { mealCategoryCollection } from "../../../models/MealCategories";
import { productCollection } from "../../../models/Products";
import { shopCollection } from "../../../models/Shops";

export const getMealsNearby = async (
  userId: string,
  page: number,
  limit: number,
  category: string = "all"
): Promise<ControllerResponseInterface> => {
  try {
    const query: any = {};

    const userDetails = await customerCollection.findById(userId);

    query.country = userDetails?.country;

    const shops = await shopCollection.find(query);

    const shopIdsCloseby = shops.map((s) => s.id);

    let query2: any = { shopId: { $in: shopIdsCloseby } };

    if(category.toLocaleLowerCase() != "all") {
      query2.categories = {$in: category};
    }

    const mealsNearby = await productCollection.paginate(
      query2,
      {
        page,
        limit,
        populate: [
          {
            path: "shopId",
            select: "shopName shopLogo shopAddress"
          }
        ],
      }
    );

    return {
      result: mealsNearby,
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

export const getMealDetails = async (
  mealId: string
): Promise<ControllerResponseInterface> => {
  try {
    const mealDetails = await productCollection
      .findById(mealId)
      .populate("shopId");

      if(!mealDetails) {
        return {
          result: null,
          error: "Meal not found",
          status: 400
        }
      }

      const recommendations = await productCollection.find({
        _id: {$ne: mealId},
        categories: {$in: mealDetails?.categories}
      }).populate("shopId").limit(5);

    return {
      result: {
        mealDetails,
        recommendations
      },
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

export const searchMealsNearby = async (
  searchWord: string,
  userId: string
): Promise<ControllerResponseInterface> => {
  try {
    const query: any = {};

    const userDetails = await customerCollection.findById(userId);

    query.country = userDetails?.country;

    const shops = await shopCollection.find(query);

    const shopIdsCloseby = shops.map((s) => s.id);

    const mealsNearby = await productCollection
      .find({
        _id: { $in: shopIdsCloseby },
        productName: { $regex: new RegExp(searchWord, "i") },
      })
      .limit(50)
      .populate("shopId");

    return {
      result: mealsNearby,
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
