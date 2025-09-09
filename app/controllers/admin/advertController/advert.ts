import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { advertsCollection } from "../../../models/Adverts";
import { CreateAdvert, UpdateAdvert } from "./dto/createAdvertDTO";

export const adminGetAllAdverts =
  async (): Promise<ControllerResponseInterface> => {
    try {
      const adverts = await advertsCollection.find({});

      return {
        result: adverts,
        status: 200,
        error: null,
      };
    } catch (error: any) {
      return {
        result: null,
        status: error.status || 500,
        error,
      };
    }
  };

export const adminAddAdvert = async ({
  shopId,
  productId,
  advertType,
  picture,
  title,
  writeup,
  url,
  startDate,
  endDate,
  amountPaidForAd,
  states,
}: CreateAdvert): Promise<ControllerResponseInterface> => {
  try {
    const newAdvert = await advertsCollection.create({
      shopId,
      productId,
      advertType,
      picture,
      title,
      writeup,
      url,
      startDate,
      endDate,
      amountPaidForAd,
      states,
    });

    return {
      result: newAdvert,
      status: 201,
      error: null,
    };
  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
};

export const adminViewAdvert = async (advertId: string): Promise<ControllerResponseInterface> => {
    try {
      const advert = await advertsCollection.findById(advertId);
  
      return {
        result: advert,
        status: 200,
        error: null,
      };
    } catch (error: any) {
      return {
        result: null,
        status: error.status || 500,
        error,
      };
    }
  };

export const adminUpdateAdvert = async ({
    shopId,
    productId,
    advertType,
    picture,
    title,
    writeup,
    url,
    startDate,
    endDate,
    amountPaidForAd,
    states,
    advertId
  }: UpdateAdvert): Promise<ControllerResponseInterface> => {
    try {
      const updatedAdvert = await advertsCollection.findByIdAndUpdate(advertId, {
        shopId,
        productId,
        advertType,
        picture,
        title,
        writeup,
        url,
        startDate,
        endDate,
        amountPaidForAd,
        states,
      });
  
      return {
        result: updatedAdvert,
        status: 200,
        error: null,
      };
    } catch (error: any) {
      return {
        result: null,
        status: error.status || 500,
        error,
      };
    }
  };


  export const adminDeleteAdvert = async (advertId: string): Promise<ControllerResponseInterface> => {
    try {
      const deletedAdvert = await advertsCollection.findByIdAndDelete(advertId);
  
      return {
        result: deletedAdvert,
        status: 200,
        error: null,
      };
    } catch (error: any) {
      return {
        result: null,
        status: error.status || 500,
        error,
      };
    }
  };
