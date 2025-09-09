import axios from "axios";
import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { customerCollection } from "../../../models/Customers";
import { comparePassword, hashPassword } from "../../../utils/authUtilities";
import { feedbackCollection } from "../../../models/Feedback";

export const customerProfile = async (
  userId: string
): Promise<ControllerResponseInterface> => {
  try {
    const userProfile = await customerCollection.findById(userId);

    return {
      result: userProfile,
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

export const changeProfilePic = async (
  userId: string,
  profilePic: string
): Promise<ControllerResponseInterface> => {
  try {
    const updatedProfilePic = await customerCollection
      .findByIdAndUpdate(
        userId,
        {
          profilePic,
        },
        { new: true }
      )
      .select("profilePic");

    return {
      result: updatedProfilePic,
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

export const changeProfileDetails = async (
  userId: string,
  setProfile: any
): Promise<ControllerResponseInterface> => {
  try {
    delete setProfile.password;
    delete setProfile.userUniqueId;
    delete setProfile.email;
    delete setProfile.emailVerified;
    delete setProfile.secondaryEmailVerified;
    delete setProfile.phoneNumberVerified;
    delete setProfile.loginType;
    delete setProfile.profilePic;
    delete setProfile.providerId;
    delete setProfile.isOnline;
    delete setProfile.accountDetails;

    const updatedProfileDetails = await customerCollection.findByIdAndUpdate(
      userId,
      setProfile,
      { new: true }
    );

    return {
      result: updatedProfileDetails,
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

export const changeCustomerPassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<ControllerResponseInterface> => {
  try {
    const userDetails = await customerCollection.findById(userId);

    if (userDetails?.loginType != "credentials") {
      return {
        result: "Invalid login provider",
        status: 400,
      };
    }

    const passwordsMatch = comparePassword(
      oldPassword,
      userDetails!!.password as string
    );

    if (!passwordsMatch) {
      return {
        result: "Invalid old password",
        status: 400,
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        result: "New and confirm passwords do not match",
        status: 400,
      };
    }

    const newHashedPassword = hashPassword(newPassword);

    await customerCollection.findByIdAndUpdate(userId, {
      password: newHashedPassword,
    });

    return {
      result: "New password updated successfully",
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



export const changeCustomerBankAccountDetails = async (
    userId: string,
    bankCode: string,
    accountName: string,
    accountNumber: string
  ): Promise<ControllerResponseInterface> => {
    try {
    
        const response = await axios.post("https://api.paystack.co/transferrecipient", {
          type: "nuban",
          currency: "NGN",
          account_number: accountNumber,
          name: accountName,
          bank_code: bankCode
        }, {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
          }
        });
    
        const updatedDetails = await customerCollection.findByIdAndUpdate(userId, {
          accountDetails: {
            recepientCode: response.data.data.recipient_code,
            type: response.data.data.type,
            id: response.data.data.id,
            active: response.data.data.active,
            ...response.data.data.details
          }
        }, {new: true});
  
      return {
        result: "New password updated successfully",
        status: 200,
        details: updatedDetails
      };
    } catch (error: any) {
      return {
        result: null,
        status: error.status || 500,
        error,
      };
    }
  };



  export const customerFeedback = async (
    userId: string,
    feedback: string,
    
  ): Promise<ControllerResponseInterface> => {
    try {
    
        await feedbackCollection.create({
          userId, feedback
        });
  
      return {
        result: "Feedback updated successfully",
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
