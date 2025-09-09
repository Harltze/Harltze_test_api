import {
  Response,
  Router,
  NextFunction,
  response,
  Request,
  query,
} from "express";
import {
  authenticatedUsersOnly,
  CustomRequest,
  CustomResponse,
} from "../../middleware/authenticatedUsersOnly";
import roleBasedAccess from "../../middleware/roleBasedAccess";
// import { propertyCollection } from "../../models/Products";
import { pageAndLimit } from "../../utils/paginateOption";
import { comparePassword, hashPassword, signJWT } from "../../utils/authUtilities";
// import { userCollection } from "../../models/Customers";
import { propertyOrderCollection } from "../../models/PropertyOrders";
import axios from "axios";
import {
  getCategories,
  getCollections,
} from "../../controllers/shared/categoryController";
import { notifications } from "../../controllers/shared/notificationController";
import {
  getShopProducts,
  shopViewProductById,
} from "../../controllers/shared/productController";
import { getGalleryPictures } from "../../controllers/shared/galleryController";
import { mealCategoryCollection } from "../../models/MealCategories";
import { productCollection } from "../../models/Products";
import mongoose from "mongoose";
import jsonJWT from "jsonwebtoken";
import { customerCollection } from "../../models/Customers";
import { shopCollection } from "../../models/Shops";
import { v4 } from "uuid";

const sharedRoutes = Router();

sharedRoutes.get(
  "/categories",
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await getCategories(req.query);
    res.status(response.status).send(response);
  }
);

sharedRoutes.get(
  "/categories-with-products",
  async (req: Request, res: Response, next: NextFunction) => {
    const {collectionId} = req.query;

    const matchQuery: any = {};

    if(collectionId && collectionId != "all") {
      matchQuery.clotheCollection = {$in: [new mongoose.Types.ObjectId(collectionId as string)]}
    }


    try {

      const result = await mealCategoryCollection.find(matchQuery).populate("clotheCollection");

      // const result = await productCollection.aggregate([
      //   {
      //     $match: matchQuery
      //   },
      //   {
      //     $unwind: {
      //       path: "$categories",
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: "$categories",
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "categories",
      //       localField: "_id",
      //       foreignField: "_id",
      //       as: "unique",
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$unique",
      //     },
      //   },
      //   {
      //     $replaceRoot: {
      //       newRoot: "$unique",
      //     },
      //   },
      // ]);

      res.send({ result });

    } catch (error) {
      next(error);
    }
  }
);

sharedRoutes.get(
  "/collections-with-products",
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      const query: any = {};

      if(req.query.type) {
        query.type = req.query.type;
      }

      const result = await productCollection.aggregate([
        {
          $match: query
        },
        {
          $unwind: {
            path: "$clothesCollections",
          },
        },
        {
          $group: {
            _id: "$clothesCollections",
          },
        },
        {
          $lookup: {
            from: "clothescollections",
            localField: "_id",
            foreignField: "_id",
            as: "unique",
          },
        },
        {
          $unwind: {
            path: "$unique",
          },
        },
        {
          $replaceRoot: {
            newRoot: "$unique",
          },
        },
      ]);

      res.send({ result });
    } catch (error) {
      next(error);
    }
  }
);

sharedRoutes.get(
  "/collections",
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await getCollections(req.query);
    console.log(response);
    res.status(response.status).send(response);
  }
);

sharedRoutes.get(
  "/shop-product/:productId",
  async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await shopViewProductById(req.params.productId);
    res.status(response.status).send(response);
  }
);

// Product routes
sharedRoutes.get(
  "/shop-products",
  async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await getShopProducts(
      req.query.query as string,
      req.query.category as string,
      req.query.productOrStudio as string,
      req.query.isAdmin as any,
      parseInt(req.query.page as string),
      parseInt(req.query.limit as string),
      req.query.clothesCollections as string
    );
    res.status(response.status).send(response);
  }
);

sharedRoutes.get("/sku/:sku", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const result = await productCollection.findOne({'sizeAndColor.sizes.sku': req.params.sku});
  res.send({result});
});

sharedRoutes.get(
  "/gallery/:page?/:limit?",
  async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await getGalleryPictures(
      parseInt(req.params.page),
      parseInt(req.params.limit)
    );
    res.status(response.status).send(response);
  }
);


sharedRoutes.post(
  "/refresh-token",
  async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    try {
      
      const refreshToken = req.body.refreshToken;
      if (!refreshToken) {
          return res.status(401).json({ message: 'Refresh token not found' });
      }
      const verify: any = jsonJWT.verify(refreshToken, process.env.REFRESH_KEY as string);
  
      var userDetails: any;

      if(verify.role == "customer") {
        userDetails = await customerCollection.findById(verify?.userId);
      } else {
        userDetails = await shopCollection.findById(verify?.userId);
      }
  
      if(!userDetails) {
        if(verify.role == "customer") {
        await customerCollection.findByIdAndUpdate(verify.userId, {tempId: null});
      } else {
        await shopCollection.findByIdAndUpdate(verify.userId, {tempId: null});
      }
        res.status(400).send({message: "Invalid token"});
        return;
      }
  
      const newRefreshToken = jsonJWT.sign({
            userId: userDetails.id,
            tempId: userDetails.tempId,
            role: verify.role,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7)
          }, process.env.REFRESH_KEY as string);
  
          const jwt = signJWT({
        email: userDetails.email,
        fullName: `${userDetails.firstName} ${userDetails.lastName}`,
        userId: userDetails.id,
        role: verify.role,
        exp: Math.floor(Date.now() / 1000) + (60 * 10)
      });
  
      res.send({newRefreshToken, accessToken: jwt});
    } catch (error) {
      next(error);
    }
  }
);

sharedRoutes.use(authenticatedUsersOnly);

sharedRoutes.get(
  "/notifications/:userType/:page?/:limit?",
  async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await notifications(
      req.userDetails!!.userId,
      req.params.userType as any,
      parseInt(req.params.page),
      parseInt(req.params.limit)
    );
    res.status(response.status).send(response);
  }
);

export default sharedRoutes;
