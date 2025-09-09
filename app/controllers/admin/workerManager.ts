import { nanoid } from "nanoid";
import { shopCollection, shopCollectionType } from "../../models/Shops"
import { deletedCollection } from "../../models/DeletedObjects";
import { hashPassword } from "../../utils/authUtilities";
import { sendEmail } from "../../utils/emailUtilities";

export const getWorkers = async (type: string, page: string, limit: string, shopUniqueId?: string) => {
  try {

    if(!shopUniqueId) {
        return {
        result: null,
        status: 400,
        error: "Shop not found",
      };
    }

    const workers = await shopCollection.paginate(
        {shopUniqueId, role: type},
        {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 1
        }
    );

    return {
        result: workers,
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
}

export const addWorker = async (shopUniqueId: string, firstName: string, lastName: string, phoneNumber: string, email: string, role: string) => {
    try {

        const emailAlreadyExist = await shopCollection.findOne({email});
        const refAlreadyExist = await shopCollection.findOne({ref: email.split("@")});

        const password = nanoid(8);
        let ref: string;

        if(refAlreadyExist) {
            ref = email.split("@") + nanoid(6);
        } else {
            ref = email.split("@")[0];
        }

        if(emailAlreadyExist) {
            return {
                result: null,
                status: 409,
                error: "Email already exist",
            };
        }

        const shopDetails = await shopCollection.findOne({shopUniqueId});

        const newWorker = await shopCollection.create({
            firstName, lastName, phoneNumber, email, password: hashPassword(password), role,
            shopName: shopDetails?.shopName,
            shopLogo: shopDetails?.shopLogo,
            shopAddress: shopDetails?.shopAddress,
            shopUniqueId: shopDetails?.shopUniqueId,
            loginType: "credentials",
            country: shopDetails?.country,
            ref,
        });

        await sendEmail({
            to: email,
            subject: "Harltze - Welcome",
            body: `
                <div>
                    <div>Welcome to Harltze</div>
                    <div>Here are your ${role} credentials</div>
                    <div>Email: ${email}</div>
                    <div>Password: ${password}</div>
                </div>
            `
        });

        return {
        result: newWorker,
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
}

export const editWorker = async (
    userMakingTheRequest: string,
    recordId: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    role?: string
) => {

    
    
    try {
        const u = await shopCollection.findById(userMakingTheRequest);
        
        if(u?.role == "admin") {
            await shopCollection.findByIdAndUpdate(recordId, {
                firstName,
                lastName,
                phoneNumber,
                role
            });
        } else {
            await shopCollection.findByIdAndUpdate(recordId, {
                firstName,
                lastName,
                phoneNumber
            });
        }

        return {
        result: "Worker edited",
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
}

export const deleteWorker = async (userMakingTheRequest: string, recordId: string) => {
    try {
        
        const u = await shopCollection.findById(userMakingTheRequest);

        const userDetails = await shopCollection.findById(recordId);

        if(!userDetails) {
            return {
                result: "No record found",
                status: 404,
                error: null,
            };
        }

        if((userDetails?._id!!).toString() == userMakingTheRequest) {
            return {
                result: "You are not allowed to delete your account for now, thank you",
                status: 401,
                error: null,
            };
        }

        if(u?.role == "admin") {
            // const userDetails = await shopCollection.findById(workerId);
            await shopCollection.findByIdAndDelete(recordId);
            await deletedCollection.create({
                deletedDataType: "shop",
                deletedObject: userDetails
            });
        } else {
            return {
                result: "You are not allowed to delete account",
                status: 401,
                error: null,
            };
        }

        return {
        result: "Worker deleted",
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
}

export const registerAffiliate = async (
    refId: string, firstName: string, lastName: string, phoneNumber: string, email: string, password: string
) => {
    try {
        const refDetails = await shopCollection.findOne({_id: refId});
        
        if(!refDetails) {
            return {
                result: "Ref not found",
                status: 404,
                error: null,
            };
        }
        const emailAlreadyExist = await shopCollection.findOne({email});

        if(emailAlreadyExist) {
            return {
                result: "Email already exist",
                status: 409,
                error: null,
            };
        }

        const refAlreadyExist = await shopCollection.findOne({ref: email.split("@")});

        let ref: string;

        if(refAlreadyExist) {
            ref = email.split("@")[0] + "-" + nanoid(6);
        } else {
            ref = email.split("@")[0];
        }
        const newWorker = await shopCollection.create({
            firstName, lastName, phoneNumber, email, password: hashPassword(password), role: "affiliate",
            shopName: refDetails?.shopName,
            shopLogo: refDetails?.shopLogo,
            shopAddress: refDetails?.shopAddress,
            shopUniqueId: refDetails?.shopUniqueId,
            loginType: "credentials",
            country: refDetails?.country,
            referredBy: refId,
            ref,
        });

        await sendEmail({
            to: email,
            subject: "Harltze - Welcome",
            body: `
                <div>Dear ${firstName} ${lastName}, welcome to Harltze Affiliate</div>
                <div>
                    <div>Your affiliate credentials are as follows</div>
                    <div>Email: ${email}</div>
                    <div>Password: ${password}</div>
                    <div>Your affiliate code is "${ref}"</div>
                </div>
            `
        });

        return {
        result: "Affiliate registered Successfully",
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
}

export const registerMarketer = async (
    refId: string, firstName: string, lastName: string, phoneNumber: string, email: string, password: string
) => {
    try {
        const refDetails = await shopCollection.findOne({_id: refId});
        
        if(!refDetails) {
            return {
                result: "Ref not found",
                status: 404,
                error: null,
            };
        }
        const emailAlreadyExist = await shopCollection.findOne({email});

        if(emailAlreadyExist) {
            return {
                result: "Email already exist",
                status: 409,
                error: null,
            };
        }

        const refAlreadyExist = await shopCollection.findOne({ref: email.split("@")});

        let ref: string;

        if(refAlreadyExist) {
            ref = email.split("@") + "-" + nanoid(6);
        } else {
            ref = email.split("@")[0];
        }
        const newWorker = await shopCollection.create({
            firstName, lastName, phoneNumber, email, password: hashPassword(password), role: "marketer",
            shopName: refDetails?.shopName,
            shopLogo: refDetails?.shopLogo,
            shopAddress: refDetails?.shopAddress,
            shopUniqueId: refDetails?.shopUniqueId,
            loginType: "credentials",
            country: refDetails?.country,
            referredBy: refId,
            ref,
        });

        await sendEmail({
            to: email,
            subject: "Harltze - New account",
            body: `
                <div>Dear ${firstName} ${lastName}, welcome to Harltze Affiliate</div>
                <div>
                    <div>Your credentials are as follows</div>
                    <div>Email: ${email}</div>
                    <div>Password: ${password}</div>
                </div>
            `
        });

        return {
        result: "Affiliate registered Successfully",
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
}
