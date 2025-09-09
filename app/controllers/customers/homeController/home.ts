import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { advertsCollection } from "../../../models/Adverts";
import { customerCollection } from "../../../models/Customers";
import { orderCollection } from "../../../models/Orders";
import { productCollection } from "../../../models/Products";
import { shopCollection } from "../../../models/Shops";

// export const customerHome = async (
//   userId: string
// ): Promise<ControllerResponseInterface> => {
//   try {
//     const userDetails = await customerCollection.findById(userId);

//     const today = new Date();

//     let adverts: any = await advertsCollection
//       .find({
//         $and: [{ startDate: { $lte: today } }, { endDate: { $gt: today } }],
//       })
//       .populate("shops")
//       .populate("products");

//     const recent10Orders = await orderCollection
//       .find({ customerId: userId })
//       .limit(10);

//     const recentOrderShopIds = recent10Orders.map((o) => o.shopId.toString());

//     const interestedCategories = await productCollection.distinct(
//       "categories",
//       { shopId: { $in: recentOrderShopIds } }
//     );

//     console.log(interestedCategories);

//     const shopsInMyLGA = await shopCollection.find({}).sort({createdAt: -1});

//     let forYou: any[] = await productCollection
//       .find({
//         categories: { $in: interestedCategories },
//         shopId: { $in: shopsInMyLGA },
//       })
//       .sort({ createdAt: -1 })
//       .limit(10);

//       if(forYou.length < 10) {
//         forYou = await productCollection.find({
//           shopId: { $in: shopsInMyLGA }
//         }).sort({createdAt: -1}).limit(10);
//       }

//       const products = await productCollection.paginate({}, {
//         page: 1, limit: 1
//       });

//       const shops = await shopCollection.paginate({}, {
//         page: 1, limit: 1
//       });

//     return {
//       result: {
//         adverts,
//         recent10Orders,
//         forYou,
//         shopsInMyLGA,
//         products,
//         shops
//       },
//       status: 200,
//     };
//   } catch (error: any) {
//     return {
//       result: null,
//       status: error.status || 500,
//       error,
//     };
//   }
// };

export const mealsNearby = async (userId: string, page: number, limit: number): Promise<ControllerResponseInterface> => {
  try {
    
    const userDetails = await customerCollection.findById(userId);

    const shopsNearby = await shopCollection.find({country: userDetails?.country});

    const shopIds = shopsNearby.map(s => s.id);

    const products = await productCollection.paginate({shopId: {$in: shopIds}}, {
      page, limit, populate: [
        {
          path: "shopId",
          select: "shopName shopLogo shopAddress"
        }
      ]
    });

    return {
      result: products,
      status: 200,
      error: null
    };

  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
}


export const shopsNearby = async (userId: string, page: number, limit: number): Promise<ControllerResponseInterface> => {
  try {
    
    const userDetails = await customerCollection.findById(userId);

    const shopsNearby = await shopCollection.paginate({country: userDetails?.country}, {
      page, limit, select: "shopName shopLogo shopPictures shopAddress"
    });
    
    return {
      result: shopsNearby,
      status: 200,
      error: null
    };

  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
}
