import Joi from "joi";
import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { productCollection } from "../../../models/Products";
import QRCode from "qrcode";
import { AddOrEditProductInterface } from "./dtos/addOrEditProduct";
import { textToSlug } from "../../../utils/textSlugUtil";
import mongoose from "mongoose";
import { uploadBase64Image } from "../../../utils/cloudinaryUtils";
import { orderCollection } from "../../../models/Orders";
import { markOrderAsDelivered } from "../../customers/ordersController/orders";
import { bringBackCollection } from "../../../models/BringBack";
import { clothesCollection } from "../../../models/ClothesCollections";
import { subscribersCollection } from "../../../models/subscribersModel";


export const adminHome = async () => {
  try {
    
    const totalProducts = await productCollection.countDocuments({});

    const inStock = await productCollection.countDocuments({stockStatus: "in-stock"});
    const outOfStock = await productCollection.countDocuments({stockStatus: "out-of-stock"});
    const archived = await productCollection.countDocuments({stockStatus: "archived"});

    const pendingOrders = await orderCollection.countDocuments({shippingStatus: {$lt: 6}, orderStatus: "paid"});
    const totalSubscribers = await subscribersCollection.countDocuments();

    return {
      result: {
        totalProducts, inStock, outOfStock, pendingOrders, archived, totalSubscribers
      },
      status: 200
    };

  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
}

async function findClotheCollection(id: string) {
  return await clothesCollection.findById(id);
}

export const addAProduct = async ({
  productName,
  description,
  cost,
  forType,
  stockStatus,
  sizeAndColor,
  categories,
  totalRequiredCravings,
  clothesCollections,
  productStatus,
  sizeChart
}: AddOrEditProductInterface, role: string): Promise<ControllerResponseInterface> => {
  try {
    const phoneRegex =
      /(?:\+?\d{1,3})?\s?\(?\d{1,4}?\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/;

    const urlRegex = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;

    const { error } = Joi.object({
      productName: Joi.string().min(4).required(),
      description: Joi.string().messages({
          "string.empty": "Desciption can not be empty.",
        }),
      forType: Joi.array().items(Joi.string().min(1).required()).required(),
      sizeAndColor: Joi.array().items(
        Joi.object({
          color: Joi.string().required(),
          colorCode: Joi.string().required(),
          sizes: Joi.array().items({
            size: Joi.string().required(),
            quantityAvailable: Joi.number().required(),
            sku: Joi.string().required()
          }).min(1).required(),
          pictures: Joi.array().min(2).required(),
        })
      ).min(1).required(),
      cost: Joi.number().min(100).required(),
      totalRequiredCravings: Joi.number().optional(),
      stockStatus: Joi.string().valid('in-stock', 'out-of-stock').required(),
      productStatus: Joi.string().required(),
      categories: Joi.array()
        .items(Joi.string().length(24).required())
        .required().min(1),
      clothesCollections: Joi.array()
        .items(Joi.string().length(24).required())
        .required(),
        sizeChart: Joi.array().required()
    }).validate({
      productName,
      description,
      stockStatus,
      clothesCollections,
      forType,
      cost,
      totalRequiredCravings,
      categories,
      sizeAndColor,
      productStatus,
      sizeChart
    });

    if (error) {
      console.log(error);
      console.log(sizeAndColor);
      return {
        result: null,
        status: 400,
        error: error.message,
      };
    }

    const ccId = clothesCollections[0]!!;

    const clothesCollectionValue = await findClotheCollection(ccId);

    await productCollection.create({
      cost: cost * 100,
      productName,
      sizeAndColor,
      forType,
      description,
      stockStatus: clothesCollectionValue?.type == "product" ? stockStatus : "archived",
      categories,
      clothesCollections,
      totalRequiredCravings,
      productStatus: role == "admin" ? productStatus : ( productStatus == "published" ? "in-review" : productStatus),
      sizeChart
    });

    return {
      result: "Product created successfully",
      status: 201,
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



export const updateProduct = async (
  productId: string,
  {
    productName,
    description,
    pictures,
    cost,
    forType,
    stockStatus,
    sizeAndColor,
    categories,
    clothesCollections,
    totalRequiredCravings,
    productStatus,
    sizeChart
  }: AddOrEditProductInterface
): Promise<ControllerResponseInterface> => {
  try {
    const productDetails = await productCollection.findById(productId);

    if (!productDetails) {
      return {
        result: "Product not found",
        status: 404,
      };
    }

    console.log("sizeChart", sizeChart);

    // const phoneRegex =
    //   /(?:\+?\d{1,3})?\s?\(?\d{1,4}?\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/;

    // const urlRegex = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;

    const { error } = Joi.object({
      productName: Joi.string().min(4).required(),
      description: Joi.string().messages({
          "string.empty": "Desciption can not be empty.",
        }),
      forType: Joi.array().items(Joi.string().min(1).required()).required(),
      sizeAndColor: Joi.array().items(
        Joi.object({
          color: Joi.string().required(),
          colorCode: Joi.string().required(),
          sizes: Joi.array().items({
            size: Joi.string().required(),
            quantityAvailable: Joi.number().required(),
            sku: Joi.string().required()
          }).min(1).required(),
          pictures: Joi.array().min(2).required(),
        })
      ).min(1).required(),
      cost: Joi.number().min(100).required(),
      totalRequiredCravings: Joi.number().optional(),
      stockStatus: Joi.string().valid('in-stock', 'out-of-stock').required(),
      categories: Joi.array()
        .items(Joi.string().length(24).required()).min(1)
        .required(),
        clothesCollections: Joi.array()
        .items(Joi.string().length(24).required()).min(1)
        .required(),
        productStatus: Joi.string().required(),
        sizeChart: Joi.array().required()
    }).validate({
      productName,
      description,
      stockStatus,
      clothesCollections,
      totalRequiredCravings,
      forType,
      cost,
      categories,
      sizeAndColor,
      productStatus,
      sizeChart
    });

    if (error) {
      console.log(error);
      return {
        result: null,
        status: 400,
        error: error.message,
      };
    }

    const ccId = clothesCollections[0]!!;

    const clothesCollectionValue = await findClotheCollection(ccId);

    console.log("clothesCollectionValue", clothesCollectionValue);

    console.log("categories", categories);

    await productCollection.findByIdAndUpdate(productId, {
      productName,
      description,
      pictures,
      cost: cost * 100,
      forType,
      stockStatus: clothesCollectionValue?.type == "product" ? stockStatus : "archived",
      sizeAndColor,
      categories,
      totalRequiredCravings,
      clothesCollections,
      productStatus,
      sizeChart
    });

    if(stockStatus == "archived") {
      await bringBackCollection.deleteMany({productId});
    }

    return {
      result: "Product updated successfully",
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

export const updateProductStockStatus = async (
  productId,
  { stockStatus }: AddOrEditProductInterface
): Promise<ControllerResponseInterface> => {
  try {
    const productDetails = await productCollection.findById(productId);

    if (!productDetails) {
      return {
        result: "Product not found",
        status: 404,
      };
    }

    await productCollection.findByIdAndUpdate(productId, {
      stockStatus,
    });

    return {
      result: "Stock status updated successfully",
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

export const deleteProduct = async (
  productId: string
): Promise<ControllerResponseInterface> => {
  try {
    const productDetails = await productCollection.findById(productId);

    if (!productDetails) {
      return {
        result: "Product not found",
        status: 404,
      };
    }

    await productCollection.findByIdAndDelete(productId);

    return {
      result: "Stock status deleted successfully",
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

export const adminMarkOrderAsDelivered = async (orderId: string) => {
  try {
    
    const productDetails = await orderCollection.findById(orderId);

    if(!productDetails) {
      return {
        result: "Order not found",
        status: 404,
      };
    }

    if(productDetails.orderStatus != "paid") {
      return {
        result: "You can only mark orders that has been paid for",
        status: 401,
      };
    }

    await orderCollection.findByIdAndUpdate(orderId, {
      orderStatus: "completed"
    });

    return {
      result: "Order marked as delivered successfully",
      status: 200
    };

  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
}
