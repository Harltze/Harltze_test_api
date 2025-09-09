import express from "express";
import * as statusCodes from "readable-http-codes";
import {
  comparePassword,
  signJWT,
  genOTP,
  isTimeDifferenceGreaterThan30Minutes,
  hashPassword,
} from "../../utils/authUtilities";
import { customerCollection } from "../../models/Customers";
import { sendEmail } from "../../utils/emailUtilities";
import { OTPCollection } from "../../models/OtpManager";
import { CustomRequest } from "../../middleware/authenticatedUsersOnly";
import { v4 as uuidV4, v4 } from "uuid";
import { readdirSync } from "fs";
import { loginValidationSchema } from "../../../validations/authValidations";
import jsonwebtoken from "jsonwebtoken";
import { SMSOTPCollection } from "../../models/SmsOtpManager";
import axios from "axios";
import { sendZeptoEmailWithOTP } from "../../utils/zeptoMailUtils";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { OAuth2Client } from "google-auth-library";
// import { sampleUserCollection } from "../../models/SampleUser";
import { StatusCodes } from "readable-http-codes";

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.clientID,
//       clientSecret: process.env.clientSecret,
//       callbackURL: process.env.callbackURL,
//       session: process.env.session,
//       prompt: process.env.prompt,
//     },
//     async function (_accessToken, _refreshToken, profile, cb) {
//       const authProfile = profile._json;

//       console.log("profile", profile._json);

//       let user = await userCollection.findOne({ email: authProfile?.email });

//       if (!user) {
//         user = await userCollection.create({
//           firstName: authProfile?.given_name,
//           lastName: authProfile?.family_name,
//           email: authProfile?.email,
//           emailVerified: authProfile?.email_verified,
//           secondaryEmail: authProfile?.email,
//           secondaryEmailVerified: authProfile.email_verified,
//           loginType: "google",
//           provider: "google",
//           providerId: authProfile?.sub,
//           profilePic: authProfile?.picture,
//         });
//       }

//       cb(null, user);
//     }
//   )
// );

const router = express.Router();

// const client = new OAuth2Client(
//   process.env.clientID
// );

// router.post("/auth/google/callback", async (req, res) => {
//   const { idToken } = req.body;

//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: idToken,
//       audience:
//         process.env.clientID, // Specify the CLIENT_ID of the app that accesses the backend
//     });

//     const payload: any = ticket.getPayload();
//     const userId = payload["sub"];
//     console.log(payload);

//     let user = await userCollection.findOne({
//       providerId: userId,
//       provider: "google",
//     });

//     if (!user) {
//       user = await userCollection.create({
//         providerId: userId,
//         provider: "google",
//         loginType: "google",
//         email: payload.email,
//         firstName: payload.name,
//         lastName: payload.name,
//       });
//     }

//     // Generate JWT token
//     const token = signJWT({
//       fullName: payload.name,
//       email: payload.email,
//       role: "user",
//       userId,
//     });
//     res.json({ token });
//   } catch (error) {
//     res.status(401).json({ message: "Invalid ID token" });
//   }
// });

// router.get(
//   "/login/federated/google",
//   passport.authenticate("google", {
//     session: false,
//     scope: ["profile", "email"],
//     prompt: "select_account",
//   })
// );

// router.get(
//   "/oauth2/redirect/google",
//   passport.authenticate("google", {
//     // successReturnToOrRedirect: 'http://localhost:3000/',
//     // failureRedirect: '/login',
//     session: false,
//     prompt: "select_account",
//   }),
//   (
//     req: express.Request | any,
//     res: express.Response,
//     next: express.NextFunction
//   ) => {
//     console.log("Logged in payload", req.user);

//     const user = req.user;

//     const jwt = signJWT({
//       email: user.email,
//       userId: user._id,
//       fullName: `${user.firstName} ${user.lastName}`,
//       role: user.role,
//     });

//     const jwtExpiryDate: any = jsonwebtoken.decode(jwt);

//     res.send({
//       message: "Login Successful",
//       token: jwt,
//       jwtExpiryDate: jwtExpiryDate?.exp,
//       jwtIssueDate: jwtExpiryDate?.iat,
//       userDetails: {
//         email: user.email,
//         userId: user._id,
//         fullName: `${user.firstName} ${user.lastName}`,
//         role: user.role,
//       },
//       successful: true,
//     });
//   }
// );

// /* GET home page. */
// router.post(
//   "/register",
//   async function (
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) {
//     try {
//       let { firstName, lastName, email, password } = req.body;

//       req.body.role = "user";

//       req.body.email = req.body.email.toLocaleLowerCase();

//       let user = await userCollection.findOne({ email });

//       if (user) {
//         return res.status(409).send({
//           successful: false,
//           errorMessage: "Email already exist",
//         });
//       }

//       const hashedPassword = hashPassword(password);

//       var newUser: any;

//       if (!password) {
//         res.status(400).send("Password field is required");
//         return;
//       }

//       if (req.body.role == "user") {
//         newUser = await userCollection.create({
//           firstName,
//           lastName,
//           email,
//           secondaryEmail: email,
//           password: hashedPassword,
//         });
//       } else {
//         const accountDetails = {
//           bankName: req.body.bankName,
//           bankCode: req.body.bankCode,
//           accountName: req.body.accountName,
//           accountNumber: req.body.accountNumber,
//         };

//         newUser = await userCollection.create({
//           firstName,
//           lastName,
//           email,
//           role: req.body.role,
//           secondaryEmail: email,
//           password: hashedPassword,
//           accountDetails,
//         });
//       }

//       const token = v4();

//       const otp = genOTP();

//       if (await OTPCollection.exists({ userId: newUser._id })) {
//         await OTPCollection.deleteMany({ userId: newUser._id });
//       }

//       await OTPCollection.create({
//         userId: newUser._id,
//         uId: token,
//         otp,
//       });

//       // await sendEmail({
//       //   to: newUser.email,
//       //   subject: "Beta Tenant - Verify email",
//       //   body: `${newUser?.firstName} ${newUser?.lastName}, \n Your otp is ${otp}`
//       // });

//       await sendZeptoEmailWithOTP(
//         [
//           {
//             email: newUser?.email,
//             name: `${newUser?.firstName} ${newUser?.lastName}`,
//           },
//         ],
//         otp.toString()
//       );

//       res.send({
//         message: "Registration Successful",
//         userDetails: {
//           fullName: newUser.fullName,
//           email: newUser?.email,
//           phoneNumber: newUser?.phoneNumber,
//           city: newUser?.city,
//         },
//         verificationId: token,
//         successful: true,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.post(
//   "/login",
//   async function (
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) {
//     try {
//       const { email, password } = req.body;

//       req.body.email = req.body.email.toLocaleLowerCase();

//       // const {error} = loginValidationSchema.validate(req.body);

//       // if(error) {
//       //   console.log(error);
//       //   res.send({errorMessage: "Invalid credentials"});
//       //   return;
//       // }

//       const user = await userCollection.findOne({ email });
//       if (!user) return res.status(404).send({ message: "account-not-found" });

//       if (user.provider != "credentials") {
//         return res.status(400).send({
//           message: "Invalid login method",
//         });
//       }

//       if (!comparePassword(password, user?.password as string))
//         return res.status(400).send({ message: "invalid-credentials" });

//       if (user.emailVerified == false) {
//         const token = v4();

//         const otp = genOTP();

//         if (await OTPCollection.exists({ userId: user._id })) {
//           await OTPCollection.deleteMany({ userId: user._id });
//         }

//         await OTPCollection.create({
//           userId: user._id,
//           uId: token,
//           otp,
//         });

//         // await sendEmail({
//         //   to: user.email,
//         //   subject: "Beta Tenant - Verify email",
//         //   body: `${user?.firstName} ${user?.lastName}, \n Your otp is ${otp}`
//         // });

//         await sendZeptoEmailWithOTP(
//           [
//             {
//               email: user?.email,
//               name: `${user?.firstName} ${user?.lastName}`,
//             },
//           ],
//           otp.toString()
//         );

//         res.status(400).send({
//           isSuccessful: false,
//           errorMessage: "Email not verified",
//         });
//         return;
//       }

//       // if(!user.phoneNumber || user.phoneNumberVerified == false) {

//       //   const token = v4();

//       // const SMS_OTP = genOTP();

//       // await SMSOTPCollection.create({
//       //   uId: token,
//       //   otp: SMS_OTP,
//       //   userId: user?._id
//       // });

//       //   if(!user.phoneNumber) {
//       //     res.status(400).send({
//       //       isSuccessful: false,
//       //       verificationId: token,
//       //       errorMessage: "No phone number"
//       //     });
//       //   } else if (user.phoneNumberVerified == false) {

//       //     await axios.post("https://v3.api.termii.com/api/sms/send", {
//       //       api_key: process.env.TERMII_API_KEY,
//       //       to: user?.phoneNumber,
//       //       from: "N-Alert",
//       //       sms: `Hello ${user?.firstName} ${user?.lastName}, your Beta Tenant OTP is ${SMS_OTP}`,
//       //       type: "plain",
//       //       channel: "dnd"
//       //     });

//       //     res.status(400).send({
//       //       isSuccessful: false,
//       //       verificationId: token,
//       //       errorMessage: "Phone number not verified"
//       //     });
//       //   }
//       //   return;
//       // }

//       const jwt = signJWT({
//         email: user.email,
//         userId: user.id,
//         fullName: `${user.firstName} ${user.lastName}`,
//         role: user.role,
//       });

//       const jwtExpiryDate: any = jsonwebtoken.decode(jwt);

//       res.send({
//         message: "Login Successful",
//         token: jwt,
//         jwtExpiryDate: jwtExpiryDate?.exp,
//         jwtIssueDate: jwtExpiryDate?.iat,
//         userDetails: {
//           email: user.email,
//           userId: user._id,
//           fullName: `${user.firstName} ${user.lastName}`,
//           role: user.role,
//         },
//         successful: true,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.post(
//   "/login-with/:provider",
//   async (
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) => {
//     try {
//       const { provider } = req.params;
//       const { firstName, lastName, email, providerId } = req.body;

//       req.body.role = "user";

//       req.body.email = req.body.email.toLocaleLowerCase();

//       let user = await userCollection.findOne({ email });

//       if (user) {
//         const doProviderIdMatch = comparePassword(
//           providerId,
//           user.providerId!!
//         );

//         if (doProviderIdMatch && user.provider == provider) {
//           const jwt = signJWT({
//             email: user.email,
//             userId: user.id,
//             fullName: `${user.firstName} ${user.lastName}`,
//             role: user.role,
//           });

//           const jwtExpiryDate: any = jsonwebtoken.decode(jwt);

//           res.send({
//             message: "Login Successful",
//             token: jwt,
//             jwtExpiryDate: jwtExpiryDate?.exp,
//             jwtIssueDate: jwtExpiryDate?.iat,
//             userDetails: {
//               email: user.email,
//               userId: user._id,
//               fullName: `${user.firstName} ${user.lastName}`,
//               role: user.role,
//             },
//             successful: true,
//           });
//         } else {
//           res.status(409).send({
//             message: "Invalid login",
//           });
//         }
//       } else {
//         if (!providerId) {
//           res.status(400).send("Invalid provider ID");
//           return;
//         }

//         const hashedProviderId = hashPassword(providerId);

//         let newUser = await userCollection.create({
//           firstName,
//           lastName,
//           email,
//           secondaryEmail: email,
//           loginType: provider,
//           provider,
//           providerId: hashedProviderId,
//           emailVerified: true,
//         });

//         const jwt = signJWT({
//           email: newUser.email,
//           userId: newUser.id,
//           fullName: `${newUser.firstName} ${newUser.lastName}`,
//           role: newUser.role,
//         });

//         const jwtExpiryDate: any = jsonwebtoken.decode(jwt);

//         res.status(201).send({
//           message: "Login Successful",
//           successful: true,
//           token: jwt,
//           jwtExpiryDate: jwtExpiryDate?.exp,
//           jwtIssueDate: jwtExpiryDate?.iat,
//           userDetails: {
//             email: newUser.email,
//             userId: newUser._id,
//             fullName: `${newUser.firstName} ${newUser.lastName}`,
//             role: newUser.role,
//           },
//         });
//       }
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.post("/sample-register", async (
//   req: express.Request,
//   res: express.Response,
//   next: express.NextFunction
// ) => {
//   const {firstName, lastName, email, password} = req.body;

//   const user = await sampleUserCollection.exists({email});

//   if(user) {
//     res.status(409).send({
//       errorMessage: "Email taken already"
//     });
//     return;
//   }

//   const hashedPassword = hashPassword(password);

//   await sampleUserCollection.create({
//     firstName,
//     lastName,
//     email,
//     password: hashedPassword
//   });

//   res.status(201).send({
//     message: "User created"
//   });

// });

// router.post(
//   "/log-in",
//   async (
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) => {

//     const {email, password} = req.body;

//     const user = await sampleUserCollection.findOne({email});


//     if(!user) {
//       res.status(404).send({
//         errorMessage: "User not found"
//       });
//       return;
//     }

//     const token = signJWT({email: user.email, fullName: `${user.firstName} ${user.lastName}`, role: "user", userId: user.id});

//     res.send({
//       user: {
//         email: user.email,
//         fullName: `${user.firstName} ${user.lastName}`
//       },
//       token
//     });

//   }
// );

// router.post(
//   "/update-phone-number",
//   async function (
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) {
//     try {
//       let { verificationId, phoneNumber } = req.body;

//       if (!phoneNumber) {
//         res.status(400).send({
//           message: "Kindly input a valid phone number.",
//         });
//       }

//       if (phoneNumber[0] == "0") {
//         res.status(400).send({
//           message:
//             "Phone number has to start with your country code rather than 0",
//         });
//         return;
//       }

//       if (phoneNumber[0] == "+") {
//         phoneNumber = phoneNumber.slice(1);
//       }

//       const verificationDetails = await SMSOTPCollection.findOne({
//         uId: verificationId,
//       });

//       const user = await userCollection.findById(verificationDetails?.userId);

//       if (user?.emailVerified == false) {
//         res.status(400).send({
//           message:
//             "Your email has to be verified first before you can verify your phone number",
//         });
//         return;
//       }

//       const userDetails = await userCollection.findByIdAndUpdate(
//         verificationDetails?.userId,
//         {
//           phoneNumber,
//         },
//         { new: true }
//       );

//       await axios.post("https://v3.api.termii.com/api/sms/send", {
//         api_key: process.env.TERMII_API_KEY,
//         to: userDetails?.phoneNumber,
//         from: "N-Alert",
//         sms: `Hello ${userDetails?.firstName} ${userDetails?.lastName}, your OTP is ${verificationDetails?.otp}`,
//         type: "plain",
//         channel: "dnd",
//       });

//       res.send({
//         isSuccessful: true,
//         message: "Phone number updated",
//         verificationId,
//         phoneNumber,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.post(
//   "/verify-email",
//   async function (
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) {
//     try {
//       const { verificationId, otp } = req.body;

//       const otpDetails = await OTPCollection.findOne({
//         uId: verificationId,
//       });

//       if (!otpDetails) {
//         return res.status(404).send({
//           isSuccessful: false,
//           errorMessage: "OTP Not found",
//         });
//       }

//       if (otpDetails.otp != otp) {
//         return res.status(400).send({
//           isSuccessful: false,
//           errorMessage: "Invalid OTP",
//         });
//       }

//       if (
//         isTimeDifferenceGreaterThan30Minutes(new Date(), otpDetails.createdAt)
//       ) {
//         return res.status(400).send({
//           isSuccessful: false,
//           errorMessage: "OTP has expired.",
//         });
//       }

//       await userCollection.findByIdAndUpdate(
//         otpDetails.userId,
//         {
//           emailVerified: true,
//           secondaryEmailVerified: true,
//         },
//         { new: true }
//       );

//       // const token = v4();

//       // const SMS_OTP = genOTP();

//       // await SMSOTPCollection.create({
//       //   uId: token,
//       //   otp: SMS_OTP,
//       //   userId: userDetails?._id,
//       // });

//       res.send({
//         isSuccessful: true,
//         message: "Email verified successfully",
//         // smsOTPID: token,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.post(
//   "/verify-sms",
//   async function (
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) {
//     try {
//       const { verificationId, otp } = req.body;

//       const otpDetails = await SMSOTPCollection.findOne({
//         uId: verificationId,
//       });

//       if (!otpDetails) {
//         return res.status(404).send({
//           isSuccessful: false,
//           errorMessage: "OTP Not found",
//         });
//       }

//       if (otpDetails.otp != otp) {
//         return res.status(400).send({
//           isSuccessful: false,
//           errorMessage: "Invalid OTP",
//         });
//       }

//       if (
//         isTimeDifferenceGreaterThan30Minutes(new Date(), otpDetails.createdAt)
//       ) {
//         return res.status(400).send({
//           isSuccessful: false,
//           errorMessage: "OTP has expired.",
//         });
//       }

//       await userCollection.findByIdAndUpdate(
//         otpDetails.userId,
//         {
//           phoneNumberVerified: true,
//         },
//         { new: true }
//       );

//       res.send({
//         isSuccessful: true,
//         message: "Phone number verified successfully",
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.post(
//   "/login-with-provider/:provider",
//   async function (
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) {
//     try {
//       const { provider } = req.params;

//       const { firstName, lastName, phoneNumber, email, providerId } = req.body;

//       const user = await userCollection.findOne({ email });

//       if (!user) {
//         const newUserDetails = await userCollection.create({
//           firstName,
//           lastName,
//           email,
//           phoneNumber,
//           provider,
//           providerId,
//           emailVerified: true,
//         });

//         //   const token = v4();

//         // const SMS_OTP = genOTP();

//         // await SMSOTPCollection.create({
//         //   uId: token,
//         //   otp: SMS_OTP,
//         //   userId: newUserDetails._id
//         // });

//         // res.send({
//         //   isSuccessful: true,
//         //   message: "Update phone number",
//         //   smsOTPID: token
//         // });

//         const jwt = signJWT({
//           email: newUserDetails?.email,
//           userId: newUserDetails?.id,
//           fullName: `${newUserDetails?.firstName} ${newUserDetails?.lastName}`,
//           role: "user",
//         });

//         res.send({
//           message: "Login Successful",
//           token: jwt,
//           userDetails: {
//             email: newUserDetails.email,
//             userId: newUserDetails.id,
//             fullName: `${newUserDetails.firstName} ${newUserDetails.lastName}`,
//             role: "user",
//           },
//           successful: true,
//         });

//         return;
//       }

//       // if (providerId != user?.providerId || provider != user?.provider) return res.status(400).send({ message: "invalid-credentials" });

//       const jwt = signJWT({
//         email: user?.email,
//         userId: user?.id,
//         fullName: `${user?.firstName} ${user?.lastName}`,
//         role: "user",
//       });

//       res.send({
//         message: "Login Successful",
//         token: jwt,
//         userDetails: {
//           email: user.email,
//           userId: user._id,
//           fullName: `${user.firstName} ${user.lastName}`,
//           role: "user",
//         },
//         successful: true,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.post(
//   "/forgot-password",
//   async function (
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) {
//     try {
//       const { email } = req.body;
//       let userInfo = await userCollection.findOne({ email });
//       if (userInfo?.provider != "credentials")
//         return res.status(400).send({ errorMessage: "Invalid request" });

//       if (!userInfo) return res.status(404).send("user-not-found");

//       const otp = genOTP();
//       const uId = v4();

//       await OTPCollection.create({
//         userId: userInfo!!._id,
//         otp,
//         uId,
//       });

//       await sendEmail({
//         to: userInfo.email,
//         subject: "Beta Tenant - Forgot password",
//         body: `${userInfo?.firstName} ${userInfo?.lastName}, \n Your otp is ${otp}`,
//       });

//       res.send({
//         message: "otp-sent",
//         verificationToken: uId,
//         successful: true,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.post(
//   "/resend-otp",
//   async (
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) => {
//     try {
//       const email = req.body.email;

//       let userInfo = await userCollection.findOne({ email });
//       if (userInfo?.provider != "credentials")
//         return res.status(400).send({ message: "invalid-request" });

//       if (!userInfo) return res.status(404).send("user-not-found");

//       await OTPCollection.deleteMany({ userId: userInfo?._id });

//       const otp = genOTP();
//       const uId = uuidV4();

//       await OTPCollection.create({
//         userId: userInfo!!._id,
//         uId,
//         otp,
//       });

//       // await sendEmail({
//       //   to: userInfo.email,
//       //   subject: `Beta Tenant - OTP`,
//       //   body: `${userInfo?.firstName} ${userInfo?.lastName},\nYour otp is ${otp}`
//       // });

//       await sendZeptoEmailWithOTP(
//         [
//           {
//             email: userInfo?.email,
//             name: `${userInfo?.firstName} ${userInfo?.lastName}`,
//           },
//         ],
//         otp.toString()
//       );

//       res.send({
//         message: "otp-resent-successful",
//         verificationToken: uId,
//         successful: true,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.post(
//   "/resend-sms-otp",
//   async function (
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) {
//     try {
//       const email = req.body.email;

//       let userInfo = await userCollection.findOne({ email });
//       if (userInfo?.provider != "credentials")
//         return res.status(400).send({ message: "invalid-request" });

//       if (!userInfo) return res.status(404).send("user-not-found");

//       await SMSOTPCollection.deleteMany({ userId: userInfo?._id });

//       const otp = genOTP();
//       const uId = uuidV4();

//       await SMSOTPCollection.create({
//         userId: userInfo!!._id,
//         uId,
//         otp,
//       });

//       // await sendEmail({
//       //   to: userInfo.email,
//       //   subject: `Beta Tenant - OTP`,
//       //   body: `${userInfo?.firstName} ${userInfo?.lastName},\nYour otp is ${otp}`
//       // });

//       await axios.post("https://v3.api.termii.com/api/sms/send", {
//         api_key: process.env.TERMII_API_KEY,
//         to: userInfo?.phoneNumber,
//         from: "N-Alert",
//         sms: `Hello ${userInfo?.firstName} ${userInfo?.lastName}, your is ${otp}`,
//         type: "plain",
//         channel: "dnd",
//       });

//       res.send({
//         message: "otp-resent-successful",
//         verificationToken: uId,
//         successful: true,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.post(
//   "/reset-password",
//   async function (
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) {
//     try {
//       const { verificationToken, otp, newPassword } = req.body;

//       const user = await OTPCollection.findOne({ uId: verificationToken });

//       if (!user) {
//         return res.status(404).send({
//           errorMessage: "OTP not found",
//           successful: false,
//         });
//       }

//       if (user.otp != otp) {
//         return res.status(400).send({
//           successful: false,
//           errorMessage: "Invalid OTP",
//         });
//       }

//       var u = await userCollection.findById(user.userId);

//       if (isTimeDifferenceGreaterThan30Minutes(new Date(), user!!.updatedAt)) {
//         return res.status(400).send({
//           errorMessage: "OTP has expired, request for a new OTP",
//           successful: false,
//         });
//       }

//       if (comparePassword(newPassword, u?.password as string)) {
//         return res.status(400).send({
//           errorMessage: "Old and new passwords match",
//           successful: false,
//         });
//       }

//       if (otp != user.otp) {
//         return res.status(400).send({
//           errorMessage: "Invalid OTP",
//           successful: false,
//         });
//       }

//       const newHashedPassword = hashPassword(newPassword);

//       await userCollection.findByIdAndUpdate(user.userId, {
//         password: newHashedPassword,
//       });

//       await OTPCollection.findOneAndDelete({ uId: verificationToken });

//       res.send({
//         successful: true,
//         message: "update-successful",
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

export default router;
