import Joi, { custom } from "joi";
import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { DecodedObject } from "../../../middleware/authenticatedUsersOnly";
import { customerCollection } from "../../../models/Customers";
import {
  comparePassword,
  decryptWithAES,
  encryptWithAES,
  genOTP,
  hashPassword,
  isTimeDifferenceGreaterThan30Minutes,
  signJWT,
} from "../../../utils/authUtilities";
import { v4 } from "uuid";
import { OTPCollection } from "../../../models/OtpManager";
import { sendEmail } from "../../../utils/emailUtilities";
import jsonJWT from "jsonwebtoken";

export const registerCustomer = async ({
  firstName,
  lastName,
  phoneNumber,
  email,
  password,
}): Promise<ControllerResponseInterface> => {
  try {
    const { error } = Joi.object({
      firstName: Joi.string().min(3).required(),
      lastName: Joi.string().min(3).required(),
      phoneNumber: Joi.string().min(11).required(),
      email: Joi.string()
        .email({ tlds: { allow: ["com", "net"] } })
        .required(),
      // profilePic: Joi.string().uri().required(),
      password: Joi.string().alphanum().min(8).required(),
    }).validate({
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
    });

    if (error) {
      return {
        result: null,
        status: 400,
        error: error.message,
      };
    }

    const customerExists = await customerCollection.findOne({ email });

    if (customerExists) {
      return {
        result: null,
        status: 400,
        error: "Email taken already",
      };
    }

    const hashedPassword = hashPassword(password);

    await customerCollection.create({
      firstName,
      lastName,
      phoneNumber,
      email,
      password: hashedPassword,
    });

    return {
      result: "User created successfully",
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

export const loginCustomer = async ({
  email,
  password,
}): Promise<ControllerResponseInterface> => {
  try {

    const { error } = Joi.object({
      email: Joi.string()
        .email({ tlds: { allow:false } })
        .required(),
      password: Joi.string().alphanum().min(8).required(),
    }).validate({
      email,
      password,
    });

    if(error) {
      return {
        result: null,
        status: 400,
        error: error.message
      };
    }

    const userDetails = await customerCollection.findOneAndUpdate({ email }, {tempId: v4()}, {new: true});

    if (!userDetails) {
      return {
        result: null,
        status: 404,
        error: "No user found",
      };
    }

    console.log(password, userDetails);

    const passwordsMatch = comparePassword(
      password,
      userDetails!!.password as string
    );

    if (!passwordsMatch) {
      return {
        result: null,
        status: 401,
        error: "Invalid credentials",
      };
    }

    console.log("uDetails", userDetails);

    const jwt = signJWT({
      email: userDetails.email,
      fullName: `${userDetails.firstName} ${userDetails.lastName}`,
      userId: userDetails.id,
      role: "customer",
      exp: Math.floor(Date.now() / 1000) + (60 * 10)
    });

    const refreshToken = jsonJWT.sign({
          userId: userDetails.id,
          tempId: userDetails.tempId,
          role: "customer",
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7)
        }, process.env.REFRESH_KEY as string);

    return {
      result: jwt,
      details: {
        email: userDetails.email,
        fullName: `${userDetails.firstName} ${userDetails.lastName}`,
        profilePicture: userDetails.profilePic,
        userId: userDetails.id,
        role: "customer",
        refreshToken,
      },
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

export const forgotPasswordCustomer = async (email: string): Promise<ControllerResponseInterface> => {
  try {

    const userDetails = await customerCollection.findOne({email});

    if(!userDetails) {
      return {
        result: null,
        status: 404,
        error: "No user found",
      };
    }

    const otp = genOTP();
    const uId = v4();

    await OTPCollection.create({
      userId: userDetails._id,
      uId, otp
    });

    console.log()

    await sendEmail({
      to: email,
      subject: "Harltze - Reset Password OTP",
      body: `
      <div>Do not disclose this OTP.<div>
      <div>OTP: ${otp}</div>
      `
    });

    return {
      result: "OTP Sent successfully, kindly check your email",
      details: {uId},
      status: 200
    }

  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
}

export const confirmOTPCustomer = async (otp: string, uId: string): Promise<ControllerResponseInterface> => {
  try {
    
    const otpDetiails = await OTPCollection.findOne({uId, otp});

    if(!otpDetiails) {
      return {
        result: null,
        status: 404,
        error: "No user found",
      };
    }

    const hasOtpExpired = isTimeDifferenceGreaterThan30Minutes(new Date(), otpDetiails.createdAt);

    if(hasOtpExpired) {
      return {
        result: null,
        status: 400,
        error: "OTP has expired",
      };
    }

    const encryptResult = encryptWithAES(otpDetiails.id);

    return {
      result: "OTP verified successfully",
      details: {encryptResult},
      status: 200
    }

  } catch (error: any) {
    console.log(error);
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
}

export const updatePasswordCustomer = async (password: string, encryptedResult: string): Promise<ControllerResponseInterface> => {
  try {

    const otpId = decryptWithAES(encryptedResult);

    const otpDetails = await OTPCollection.findById(otpId);

    const userDetails = await customerCollection.findById(otpDetails?.userId);

    const userId = userDetails?.id;

    if(!userId) {
      return {
        result: null,
        status: 400,
        error: "Invalid encryptedResult",
      };
    }

    if(!password) {
      return {
        result: null,
        status: 400,
        error: "Empty password",
      };
    }

    if(password.length < 8) {
      return {
        result: null,
        status: 400,
        error: "Password too short",
      };
    }

    const hashedPassword = hashPassword(password);

    await customerCollection.findByIdAndUpdate(userId, {
      password: hashedPassword
    });

    await OTPCollection.deleteMany({
      userId
    });

    return {
      result: "Password updated successfully",
      status: 200
    }
    
  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
}
