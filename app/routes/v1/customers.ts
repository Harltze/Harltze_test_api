import { Response, Router, NextFunction, response } from "express";
import {
  authenticatedUsersOnly,
  CustomRequest,
  CustomResponse,
} from "../../middleware/authenticatedUsersOnly";
import roleBasedAccess from "../../middleware/roleBasedAccess";
import { confirmOTPCustomer, forgotPasswordCustomer, loginCustomer, registerCustomer, updatePasswordCustomer } from "../../controllers/customers/authController/auth";
// import { customerHome } from "../../controllers/customers/homeController/home";
import { getMealDetails, getMealsNearby, searchMealsNearby } from "../../controllers/customers/ProductController/products";
import { getShopById, getShopsNearby, searchShop } from "../../controllers/customers/shopsController/shops";
import { createAnOrder, createPaystackPaymentLink, markOrderAsDelivered, orderHistory, pendingOrders } from "../../controllers/customers/ordersController/orders";
import { changeCustomerBankAccountDetails, changeCustomerPassword, changeProfileDetails, changeProfilePic, customerFeedback, customerProfile } from "../../controllers/customers/profileController/profile";
import { shopCollection } from "../../models/Shops";
import { CMSCollection } from "../../models/CMSModel";
import { discountsCollection } from "../../models/DiscountModel";
import { subscribersCollection } from "../../models/subscribersModel";
import { sendEmail } from "../../utils/emailUtilities";
import { bringBackCollection } from "../../models/BringBack";
import { productCollection } from "../../models/Products";

const customerRoutes = Router();

customerRoutes.post("/subscribe", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  try {
    const {subscribersName ,subscribersEmail} = req.body;
    const alreadySubscribed = await subscribersCollection.findOne({subscribersEmail});

    if(alreadySubscribed) {
      res.status(409).send({
        message: "You've already subscribed"
      });
      return;
    }

    await subscribersCollection.create({subscribersName, subscribersEmail});

    res.status(201).send({
      message: "Subscribed successfully"
    });

  } catch (error) {
    next(error);
  }
});

customerRoutes.post("/send-message", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  try {

    const {fullName, email, message} = req.body;

    await sendEmail({
      to: process.env.EMAIL_NAME!!,
      subject: `Harltze - Contact Us Email from ${fullName}`,
      body: `
        <div style="display: flex; flex-direction: column; gap-2">
          <div>Full Name: ${fullName}</div>
          <div>Email: ${email}</div>
          <div>Message: ${message}</div>
        </div>
      `
    });
    res.send({
      message: "Email sent successfully"
    });
  } catch (error) {
    next(error);
  }
});

customerRoutes.post("/register", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await registerCustomer(req.body);
  res.status(response.status).send(response);
});

customerRoutes.post("/login", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await loginCustomer(req.body);
  res.status(response.status).send(response);
});

customerRoutes.post("/forgot-password", async (req: CustomRequest, res: CustomResponse) => {
  const response = await forgotPasswordCustomer(req.body.email);
  res.status(response.status).send(response);
});

customerRoutes.post("/confirm-otp", async (req: CustomRequest, res: CustomResponse) => {
  const response = await confirmOTPCustomer(req.body.otp, req.body.uId);
  res.status(response.status).send(response);
});

customerRoutes.post("/reset-password", async (req: CustomRequest, res: CustomResponse) => {
  const response = await updatePasswordCustomer(req.body.password, req.body.encryptedResult);
  res.status(response.status).send(response);
});

customerRoutes.use(authenticatedUsersOnly);
customerRoutes.use(roleBasedAccess(["customer"]));

// Home route
// customerRoutes.get("/home", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
//   const response = await customerHome(req.userDetails!!.userId);
//   res.status(response.status).send(response);
// });



// Meals nearby
customerRoutes.get("/meals-nearby/:page?/:limit?/:categoryValue?", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await getMealsNearby(req.userDetails!!.userId, parseInt(req.params.page), parseInt(req.params.limit), req.params.categoryValue);
  res.status(response.status).send(response);
});
customerRoutes.get("/meal-details/:mealId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await getMealDetails(req.params.mealId);
  res.status(response.status).send(response);
});

customerRoutes.post("/search-meal", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await searchMealsNearby(req.body.searchWord, req.userDetails!!.userId);
  res.status(response.status).send(response);
});


// Shops Nearby
customerRoutes.get("/shops-nearby/:page?/:limit?", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await getShopsNearby(req.userDetails!!.userId, parseInt(req.params.page), parseInt(req.params.limit));
  res.status(response.status).send(response);
});

customerRoutes.get("/shop-details/:shopId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await getShopById(req.params.shopId);
  res.status(response.status).send(response);
});

customerRoutes.get("/search-shop", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await searchShop(req.body.searchWord, req.userDetails!!.userId);
  res.status(response.status).send(response);
});

// Order Endpoints
customerRoutes.get("/pending-orders", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await pendingOrders(req.userDetails!!.userId);
  res.status(response.status).send(response);
});

customerRoutes.get("/order-history/:page?/:limit?", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await orderHistory(req.userDetails!!.userId, parseInt(req.params.page), parseInt(req.params.limit));
  res.status(response.status).send(response);
});


customerRoutes.post("/create-order", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  req.body.customerId = req.userDetails!!.userId;
  const response = await createAnOrder(req.body);
  res.status(response.status).send(response);
});


customerRoutes.post("/create-payment-link", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  req.body.customerId = req.userDetails!!.userId;
  const response = await createPaystackPaymentLink(req.userDetails!!.userId, req.body.orderId);
  res.status(response.status).send(response);
});

customerRoutes.post("/mark-order-as-delivered", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const response = await markOrderAsDelivered(req.body.orderId);
  res.status(response.status).send(response);
});

customerRoutes.post("/bring-back", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    try {

        const {productId, color, colorCode, size} = req.body;
        
        const alreadySubmitted = await bringBackCollection.findOne({
            customerId: req.userDetails?.userId!!, productId, color, colorCode, size
        });

        if(alreadySubmitted) {
            
            res.status(409).send({
                message: "You already submitted a crave for this size and color"
            });
            return;
        }

        const productDetails = await productCollection.findById(productId);

        const totalCravings = await bringBackCollection.countDocuments({productId});

        if(!productDetails) {
          res.status(422).send({
            message: "Product craved for not found"
          });
          return;
        }

        if(totalCravings >= productDetails?.totalRequiredCravings!!) {
          res.status(422).send({
            message: "Total cravings reached already"
          });
          return;
        }

        await bringBackCollection.create({
            customerId: req.userDetails?.userId!!, productId, categories: productDetails.categories, clothesCollections: productDetails.clothesCollections, color, colorCode, size
        });
        res.status(201).send({
            message: "Bring back created successfully"
        });
    } catch (error) {
        next(error);
    }
});

// Profile
customerRoutes.get("/profile", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  try {
    
    const response = await customerProfile(req.userDetails!!.userId);
    res.status(response.status).send(response);
  } catch (error) {
    next(error);
  }
});

customerRoutes.put("/profile-picture", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const {profilePic} = req.body;
  const response = await changeProfilePic(req.userDetails!!.userId, profilePic);
  res.status(response.status).send(response);
});

customerRoutes.put("/profile", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const {profile} = req.body;
  const response = await changeProfileDetails(req.userDetails!!.userId, profile);
  res.status(response.status).send(response);
});

customerRoutes.put("/password", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const {oldPassword, newPassword, confirmPassword} = req.body;
  const response = await changeCustomerPassword(req.userDetails!!.userId, oldPassword, newPassword, confirmPassword);
  res.status(response.status).send(response);
});

// customerRoutes.put("/password", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
//   const {oldPassword, newPassword, confirmPassword} = req.body;
//   const response = await changeCustomerPassword(req.userDetails!!.userId, oldPassword, newPassword, confirmPassword);
//   res.status(response.status).send(response);
// });

customerRoutes.post("/feedback", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const {feedback} = req.body;
  const response = await customerFeedback(req.userDetails!!.userId, feedback);
  res.status(response.status).send(response);
});

// Notifications
customerRoutes.put("/bank-account", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const {bankCode, accountName, accountNumber} = req.body;
  const response = await changeCustomerBankAccountDetails(req.userDetails!!.userId, bankCode, accountName, accountNumber);
  res.status(response.status).send(response);
});

customerRoutes.get("/code", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    try {
        const {
            code, codeType
        } = req.query;

        if(codeType == 'affiliate') {
            const affiliate = await shopCollection.findOne({
                ref: code, role: "affiliate"
            });

            if(!affiliate) {
                res.status(404).send({
                    message: "Can't find affiliate code. Make sure it's correct"
                });
                return;
            }

            const discountPercent = await CMSCollection.findOne({
                CMSName: "harltze"
            }).select('defaultAffiliatePercent');
            
            res.send({
                affiliate,
                discountPercent,
                code,
                codeType
            });

        } else if (codeType == 'discount') {
            const discount = await discountsCollection.findOne({discountCode: code});

            const todaysDate = new Date();

            if(!discount) {
                res.status(404).send({
                    message: "No discount found"
                });
                return;
            }

            if(todaysDate >= discount?.expiryDate) {
                res.status(401).send({
                    message: "Discount code has expired"
                });
                return;
            }

            res.send({
                discount,
                code,
                codeType
            });

        } else {
            res.status(400).send({
                message: "Invalid code type"
            });
        }

    } catch (error) {
        next(error);
    }
});

export default customerRoutes;
