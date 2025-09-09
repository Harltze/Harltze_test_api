import { v4 } from "uuid";
import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { shopCollection } from "../../../models/Shops";
import {
  comparePassword,
  hashPassword,
  isTimeDifferenceGreaterThan30Minutes,
  signJWT,
} from "../../../utils/authUtilities";
import { SMSOTPCollection } from "../../../models/SmsOtpManager";
import { OTPCollection } from "../../../models/OtpManager";
import { sendEmail } from "../../../utils/emailUtilities";
import jsonJWT from "jsonwebtoken";

export const registerShop = async ({
  firstName,
  lastName,
  shopName,
  shopLogo,
  // shopPictures,
  // ownerPictures,
  shopAddress,
  phoneNumber,
  email,
  // secondaryEmail,
  // country,
  // state,
  // city,
  password,
  address,
}): Promise<ControllerResponseInterface> => {
  try {
    const shopDetails = await shopCollection.findOne({ email });

    if (shopDetails) {
      return {
        result: null,
        status: 400,
        error: "Email taken already",
      };
    }

    const hashedPassword = hashPassword(password);

    await shopCollection.create({
      firstName,
      lastName,
      shopName,
      shopLogo,
      shopAddress,
      shopUniqueId: v4(),
      phoneNumber,
      email,
      password: hashedPassword,
      address,
    });

    return {
      result: "Shop created successfully",
      status: 201,
    };
  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
};

export const loginShop = async ({
  email,
  password,
}): Promise<ControllerResponseInterface> => {
  try {
    const shopDetails = await shopCollection.findOne({ email });

    if (!shopDetails) {
      return {
        result: null,
        status: 404,
        error: "No user found",
      };
    }

    const passwordsMatch = comparePassword(
      password,
      shopDetails!!.password as string
    );

    if (!passwordsMatch) {
      return {
        result: null,
        status: 401,
        error: "Invalid credentials",
      };
    }

    const uId = v4();
    const otp = Math.floor(Math.random() * 10000);

    await OTPCollection.create({
      userId: shopDetails.id,
      uId,
      otp,
    });

    await sendEmail({
      to: shopDetails.email,
      subject: `Harltze - OTP`,
      body: `
          <div>
            <div>Dear ${shopDetails.firstName}</div>
            <div>Your Login OTP is ${otp}</div>
          </div>
        `,
    });

    // const jwt = signJWT({
    //   email: shopDetails.email,
    //   fullName: `${shopDetails.firstName} ${shopDetails.lastName}`,
    //   userId: shopDetails.id,
    //   role: shopDetails.role,
    // });

    return {
      result: uId,
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

export const adminConfirmOTP = async (
  uId: string,
  otp: string
): Promise<ControllerResponseInterface> => {
  try {
    console.log(uId, otp);
    const otpRecord = await OTPCollection.findOne({ uId });

    if (!otpRecord) {
      return {
        result: "Invalid otp",
        status: 422,
      };
    }

    if (
      isTimeDifferenceGreaterThan30Minutes(new Date(), otpRecord?.createdAt!!)
    ) {
      return {
        result: "OTP has expired",
        status: 422,
      };
    }

    const shopDetails = await shopCollection.findByIdAndUpdate(otpRecord.userId, {tempId: v4()}, {new: true});

    if (!shopDetails) {
      return {
        result: "Users not found",
        status: 422,
      };
    }

    const jwt = signJWT({
      email: shopDetails.email,
      fullName: `${shopDetails.firstName} ${shopDetails.lastName}`,
      userId: shopDetails.id,
      role: shopDetails.role,
      exp: Math.floor(Date.now() / 1000) + (60 * 10)
    });

    const refreshToken = jsonJWT.sign({
      userId: shopDetails.id,
      tempId: shopDetails.tempId,
      role: shopDetails.role,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7)
    }, process.env.REFRESH_KEY as string);


    return {
      result: jwt,
      details: {
        email: shopDetails.email,
        fullName: `${shopDetails.firstName} ${shopDetails.lastName}`,
        profilePicture: shopDetails.profilePicture,
        userId: shopDetails.id,
        role: shopDetails.role,
        affiliateCode: shopDetails.role == "affiliate" ? shopDetails.ref : null,
        refreshToken
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
