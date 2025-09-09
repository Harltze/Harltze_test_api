import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { shopCollection } from "../../../models/Shops";
import { comparePassword, hashPassword } from "../../../utils/authUtilities";

export const shopProfile = async (
  shopId: string
): Promise<ControllerResponseInterface> => {
  try {
    const profile = await shopCollection.findById(shopId);

    return {
      result: profile,
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

export const updateShopProfile = async (
  shopId: string,
  payload: any
): Promise<ControllerResponseInterface> => {
  try {

    if(payload.email) {
      delete payload.email;
    }

    if(payload.oldPassword && payload.password && payload.password.length >= 6) {

      const userDetails = await shopCollection.findById(shopId);

      const passwordsMatch = comparePassword(payload.oldPassword, userDetails?.password!!);

      if(!passwordsMatch) {
        return {
          result: {
            message: "Incorrect old password"
          },
          status: 400
        }
      }

      payload.password = hashPassword((payload.password).toString());
    }

    const profile = await shopCollection.findByIdAndUpdate(shopId, payload, {new: true});

    return {
      result: profile,
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
