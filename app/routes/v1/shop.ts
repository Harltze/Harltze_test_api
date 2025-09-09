import { Response, Router, NextFunction, response, Request } from "express";
import { authenticatedUsersOnly, CustomRequest, CustomResponse } from '../../middleware/authenticatedUsersOnly';
import roleBasedAccess from '../../middleware/roleBasedAccess';
// import { propertyCollection } from "../../models/Products";
import { pageAndLimit } from "../../utils/paginateOption";
import { comparePassword, hashPassword } from "../../utils/authUtilities";
// import { userCollection } from "../../models/Customers";
import { propertyOrderCollection } from "../../models/PropertyOrders";
import axios from "axios";
import { addAProduct, adminHome, adminMarkOrderAsDelivered, deleteProduct, updateProduct, updateProductStockStatus } from "../../controllers/shops/products/productsController";
import { orderHistory, pendingOrders, shopPendingOrderById, updateShippingFee } from "../../controllers/shops/orders/ordersController";
import { adminConfirmOTP, loginShop, registerShop } from "../../controllers/shops/authController/auth";
import { shopProfile, updateShopProfile } from "../../controllers/shops/profileController/profile";
import { shopCollection } from "../../models/Shops";
import { createDiscount, discountCodes } from "../../controllers/shops/discountController/discount";
import { CMSCollection } from "../../models/CMSModel";
import { orderCollection } from "../../models/Orders";
import { bringBackCollection } from "../../models/BringBack";
import { discountsCollection } from "../../models/DiscountModel";
import { subscribersCollection } from "../../models/subscribersModel";
import { Types } from "mongoose";
import { affiliateCashOutHistoryCollection } from "../../models/AffiliateCashOutHistory";
import { nanoid } from "nanoid";
import { sendEmail } from "../../utils/emailUtilities";

const shopRoutes = Router();

// Auth routes
shopRoutes.post("/register", async (req: Request, res: Response, next: NextFunction) => {
    const response = await registerShop(req.body);
    res.status(response.status).send(response);
});

shopRoutes.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    const response = await loginShop(req.body);
    res.status(response.status).send(response);
});

shopRoutes.post("/confirm-otp", async (req: Request, res: Response, next: NextFunction) => {
    const response = await adminConfirmOTP(req.body.uId, req.body.otp);
    res.status(response.status).send(response);
});

shopRoutes.post("/tt", async(req: Request, res: Response) => {

    const pw = hashPassword(req.body.pw);

    await shopCollection.findOneAndUpdate({email: "olaiderabiu@outlook.com"}, {
        password: pw
    });
    res.send({message: "Password changed successfully"});
});

shopRoutes.get("/cms", async (req, res, next) => {
    try {
        const cms = await CMSCollection.findOne({CMSName: "harltze"});

        res.send({
            result: cms
        });
    } catch (error) {
        next(error);
    }
});

shopRoutes.use(authenticatedUsersOnly);
shopRoutes.use(roleBasedAccess(["admin", "affiliate", "marketer"]));

shopRoutes.get("/home", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    req.body.shopId = req.userDetails?.userId;
    const response = await adminHome();
    res.status(response.status).send(response);
});

// shopRoutes.put("/mark-as-delivered", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
//     const response = await adminMarkOrderAsDelivered(req.body.orderId);
//     res.status(response.status).send(response);
// });

shopRoutes.put("/shipping-status/:id", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    try {
        const {id} = req.params;
        const {shippingStatus} = req.body;
        const updatedProduct = await orderCollection.findByIdAndUpdate(id, {shippingStatus}, {new: true});
        res.send({updatedProduct});
    } catch (error) {
        next(error);
    }
})

shopRoutes.post("/shop-product", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    req.body.shopId = req.userDetails?.userId;
    const response = await addAProduct(req.body, req.userDetails?.role!!);
    res.status(response.status).send(response);
});

shopRoutes.put("/shop-product/:productId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    req.body.shopId = req.userDetails?.userId;
    const response = await updateProduct(req.params.productId, req.body);
    res.status(response.status).send(response);
});

shopRoutes.put("/shop-product-stock-status/:productId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    req.body.shopId = req.userDetails?.userId;
    const response = await updateProductStockStatus(req.params.productId, req.body);
    res.status(response.status).send(response);
});

shopRoutes.delete("/shop-product/:productId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    req.body.shopId = req.userDetails?.userId;
    const response = await deleteProduct(req.params!!.productId);
    res.status(response.status).send(response);
});

shopRoutes.get('/bring-back-history', async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    try {

        const {
            productId,
            categories,
            clothesCollections,
            page,
            limit
        } = req.query;

        const query: any = {}

        if(productId) {
            query.productId = productId;
        }

        if(categories) {
            query.categories = categories;
        }

        if(clothesCollections) {
            query.clothesCollections = clothesCollections;
        }
        
        const bringBackCount = await bringBackCollection.find(query).countDocuments();
        
        const bringBacks = await bringBackCollection.paginate(query, {
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 20,
            populate: [
                {
                    path: "customerId",
                    select: "-password -createdAt -updatedAt"
                },
                {
                    path: "productId",
                    select: "-createdAt -updatedAt"
                }
            ]
        });

        res.send({
            result: bringBacks,
            bringBackCount
        });

    } catch (error) {
        next(error);
    }
});

shopRoutes.get('/product-bring-back-history/all', async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    try {

        const {
            productId,
            // categories,
            // clothesCollections,
            // page,
            // limit
        } = req.query;

        const query: any = {}

        if(productId) {
            query.productId = productId;
        }
        
        const bringBacks = await bringBackCollection.find(query)
        .populate("customerId", "-password -createdAt -updatedAt")
        .populate("productId", "-createdAt -updatedAt")
        .populate("clothesCollections", "-createdAt -updatedAt")
        .populate("categories", "-createdAt -updatedAt");

        res.send({
            result: bringBacks
        });

    } catch (error) {
        next(error);
    }
});

shopRoutes.get('/product-bring-back-history', async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    try {

        const {page, limit, productId, categoryId, collectionId} = req.query;

        let query: any = {};

        if(productId) {query.productId = productId}
        if(categoryId && categoryId != "all" ) {query.categories = {$in: [categoryId]}}
        if(collectionId && collectionId != "all" ) {query.clothesCollections = {$in: [collectionId]}}

        const bringBackCount = await bringBackCollection.countDocuments(query);
        
        const bringBacks = await bringBackCollection.paginate(query, {
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 20,
            populate: [
                {
                    path: "customerId",
                    select: "-password -createdAt -updatedAt"
                },
                {
                    path: "productId",
                    select: "-createdAt -updatedAt"
                },
                {
                    path: "categories"
                },
                {
                    path: "clothesCollections"
                }
            ],
            sort: {createdAt: -1}
        });

        res.send({
            result: bringBacks,
            bringBackCount
        });

    } catch (error) {
        next(error);
    }
});

shopRoutes.delete('/bring-backs/:productId', async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    try {
        const result = await bringBackCollection.deleteMany({productId: req.params.productId});
        res.send({
            result
        });
    } catch (error) {
        next(error);
    }
});

shopRoutes.get("/affiliate-orders", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    try {
        const {page, limit, paymentStatus} = req.query;

        console.log("User", req.userDetails?.userId);

        let pStat: any = {};

        pStat.adminId = req.userDetails?.userId

        if(paymentStatus != "all") {
            pStat.paymentStatus = paymentStatus;
        }

        // Total made from orders
        const affiliatePendingCashout = await orderCollection.aggregate([
            {
                $match: {
                    affiliateId: new Types.ObjectId(req.userDetails?.userId),
                    affiliateComissionPaymentStatus: "pending",
                    shippingStatus: {$gte: 7}

                }
            },
            {
                $group: {
                    _id: null,
                    pendingWithdrawal: {
                        $sum: '$affiliateGets'
                    }
                }
            }
        ]);

        const affiliateCashedOut = await affiliateCashOutHistoryCollection.aggregate([
            {
                $match: {
                    adminId: new Types.ObjectId(req.userDetails?.userId),
                    paymentStatus: "pending"
                }
            },
            {
                $group: {
                    _id: null,
                    totalPendingCashOut: {
                        $sum: '$amountCashedOut'
                    }
                }
            }
        ]);

        const affiliateOrderHistory = await affiliateCashOutHistoryCollection.paginate(pStat, {
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 20,
            sort: {createdAt: -1}
        });


        res.send({affiliatePendingCashout: affiliatePendingCashout[0]?.pendingWithdrawal ? affiliatePendingCashout[0]?.pendingWithdrawal : 0, affiliateCashedOut: affiliateCashedOut[0]?.totalPendingCashOut ? affiliateCashedOut[0]?.totalPendingCashOut : 0, affiliateOrderHistory});

    } catch (error) {
        next(error);
    }
});

// shopRoutes.get("/affiliate-order-referral-history", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
//     try {
        
//         const affiliateOrders = await orderCollection.paginate({
//             affiliateId: req.userDetails?.userId,
//             affiliateComissionPaymentStatus
//         }, {
//             page: page ? parseInt(page as string) : 1,
//             limit: limit ? parseInt(limit as string) : 20,
//             sort: {createdAt: -1}
//         });

//     } catch (error) {
//         next(error);
//     }
// });

shopRoutes.get("/cashout", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    try {
        
        const cashOutOrders = await orderCollection.find({
            affiliateId: req.userDetails?.userId,
            affiliateComissionPaymentStatus: "pending",
            shippingStatus: {$gte: 7}
        });

        if(cashOutOrders.length == 0) {
            res.status(404).send({
                message: "No order to cash out on"
            });
            return;
        }

        const cashOutOrderIds = cashOutOrders.map(v => v.id);

        

        let total = 0;

        for(let i = 0; i < cashOutOrders.length; i++) {
            total += cashOutOrders[i].affiliateGets;
        }

        if((total / 100) < 10000) {
            res.status(422).send({message: "You can cash out only when money made is N10,000 and above"});
            return;
        }

        await orderCollection.updateMany({_id: {$in: cashOutOrderIds}}, {
            affiliateComissionPaymentStatus: "cashed-out"
        });

        await affiliateCashOutHistoryCollection.create({
            adminId: req.userDetails?.userId,
            ordersCashedOutOn: cashOutOrderIds,
            paymentStatus: "pending",
            amountCashedOut: total
        });

        res.send({
            message: "Cashout successful"
        });

    } catch (error) {
        next(error);
    }
});

shopRoutes.post("/mark-as-paid/:historyId", roleBasedAccess(["admin"]), async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    try {
        
        const {historyId} = req.params;

        const updatedHistory = await affiliateCashOutHistoryCollection.findByIdAndUpdate(historyId, {
            paymentStatus: "paid"
        }, {new: true});

        await orderCollection.updateMany({_id: {$in: updatedHistory?.ordersCashedOutOn}}, {
            affiliateComissionPaymentStatus: "paid"
        });

        res.send({updatedHistory});

    } catch (error) {
        next(error);
    }
});

shopRoutes.get("/cashout-history", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    try {

        const {paymentStatus, page, limit} = req.query;

        let query: any = {};

        if(paymentStatus != "all") {
            query.paymentStatus = paymentStatus;
        }
        
        let result: any;

        if(req.userDetails?.role == "admin") {
            result = await affiliateCashOutHistoryCollection.paginate(query, {
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 20,
                sort: {updatedAt: -1}
            });
        } else {
            query.adminId = req.userDetails?.userId;
            result = await affiliateCashOutHistoryCollection.paginate(query, {
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 20,
                sort: {updatedAt: -1}
            });
        }

        res.send({result});

    } catch (error) {
        next(error);
    }
});

// Order routes
shopRoutes.get("/pending-orders", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await pendingOrders(parseInt(req.query.page as string), parseInt(req.query.limit as string), parseInt(req.query.orderStatusFilter as string), req.query.startDate as string, req.query.endDate as string);
    res.status(response.status).send(response);
});

shopRoutes.get("/pending-order/:orderId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await shopPendingOrderById(req.params.orderId);
    res.status(response.status).send(response);
});

shopRoutes.get("/order-history/:page?/:limit?", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await orderHistory(parseInt(req.params.page), parseInt(req.params.limit), req.query.startDate as string, req.query.endDate as string);
    res.status(response.status).send(response);
});

shopRoutes.put("/update-shipping-fee", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await updateShippingFee(req.userDetails!!.userId, req.body.orderId, req.body.shippingFee);
    if(response.status == 200) {
        res.io?.to((response.result.customerId).toString()).emit("shipping-fee-update", response.result);
    }
    res.status(response.status).send(response);
});

// Discount route
shopRoutes.post("/discount-codes", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const {
        discountCode,
        discountAmountOrPercent,
        discountForProductsAbove,
        expiryDate
    } = req.body;

    console.log(req.body);

    const response = await createDiscount(
        discountCode,
        discountAmountOrPercent,
        discountForProductsAbove,
        expiryDate
    );

    res.status(response.status).send(response);

});
shopRoutes.get("/discount-codes", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await discountCodes();
    res.status(response.status).send(response);
});

// Shop profile route
shopRoutes.get("/profile", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await shopProfile(req.userDetails!!.userId);
    res.status(response.status).send(response);
});

shopRoutes.put("/update-shop-profile", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await updateShopProfile(req.userDetails!!.userId, req.body);
    res.status(response.status).send(response);
});

shopRoutes.get("/auto-reset-password/:userId", roleBasedAccess(["admin"]), async (req, res, next) => {
    try {

        if(!req.params.userId) {
            res.status(422).send({
                message: "No userId supplied found."
            });
            return;
        }
        
        const password = nanoid(8);

        const hashedPassword = hashPassword(password);
        
        const user = await shopCollection.findByIdAndUpdate(req.params.userId, {
            password: hashedPassword
        });

        sendEmail({
            to: user?.email!!,
            subject: `Harltze - [[Password reset]]`,
            body: `
            <div>
                <div>Dear ${user?.firstName} ${user?.lastName},</div>
                <div>Harltze admin has requested a password reset for your account: Your new credentials are as follows:</div>
                <div>Email: ${user?.email}</div>
                <div>Password: ${password}</div>
                <div>You can log in and change your password.</div>
            </div>
            `
        });

        res.send({
            message: "Password reset successful"
        });

    } catch (error) {
        next(error);
    }
});

shopRoutes.delete("/delete-user/:userId", async (req, res, next) => {
    try {

        const {userId} = req.params;
        
        const user = await shopCollection.findById(userId, {role: {$ne: "admin"}});

        if(!user) {
            res.status(404).send({
                message: "User not found"
            });
            return;
        }

        if(user.role == "affiliate") {
            await affiliateCashOutHistoryCollection.deleteMany({
                adminId: userId, paymentStatus: "paid"
            });
            await shopCollection.findByIdAndDelete(userId);
        } else if (user.role == "marketer") {
            await affiliateCashOutHistoryCollection.deleteMany({
                adminId: userId, paymentStatus: "paid"
            });
        }

        res.send({
            message: `${user.email}'s ${user.role} account deleted successfully`
        });

    } catch (error) {
        next(error);
    }
});

shopRoutes.put("/cms/hero", async (req, res, next) => {
    try {

        const {hero} = req.body;

        const result = await CMSCollection.findOneAndUpdate({CMSName: "harltze"}, {
            hero
        }, {new: true});

        res.send({result});
    } catch (error) {
        next(error);
    }
});

shopRoutes.put("/cms/terms-and-conditions", async (req, res, next) => {
    try {
        const {termsAndConditions} = req.body;

        const result = await CMSCollection.findOneAndUpdate({CMSName: "harltze"}, {
            termsAndConditions
        }, {new: true});
        
        res.send({result});
    } catch (error) {
        next(error);
    }
});

shopRoutes.put("/cms/privacy-policy", async (req, res, next) => {
    try {
        const {privacyPolicy} = req.body;

        const result = await CMSCollection.findOneAndUpdate({CMSName: "harltze"}, {
            privacyPolicy
        }, {new: true});
        
        res.send({result});
    } catch (error) {
        next(error);
    }
});

shopRoutes.put("/cms/cancellation-policy", async (req, res, next) => {
    try {
        const {cancellationPolicy} = req.body;

        const result = await CMSCollection.findOneAndUpdate({CMSName: "harltze"}, {
            cancellationPolicy
        }, {new: true});
        
        res.send({result});
    } catch (error) {
        next(error);
    }
});

shopRoutes.put("/cms/faqs", async (req, res, next) => {
    try {
        const {faqs} = req.body;

        const result = await CMSCollection.findOneAndUpdate({CMSName: "harltze"}, {
            faqs
        }, {new: true});
        
        res.send({result});
    } catch (error) {
        next(error);
    }
});

shopRoutes.put("/cms/footer", async (req, res, next) => {
    try {
        const {footer} = req.body;

        const result = await CMSCollection.findOneAndUpdate({CMSName: "harltze"}, {
            footer
        }, {new: true});
        
        res.send({result});
    } catch (error) {
        next(error);
    }
});

shopRoutes.put("/cms/promotion-banner", async (req, res, next) => {
    try {
        const {promotionBanner} = req.body;

        const result = await CMSCollection.findOneAndUpdate({CMSName: "harltze"}, {
            promotionBanner
        }, {new: true});
        
        res.send({result});
    } catch (error) {
        next(error);
    }
});

shopRoutes.put("/cms/premium-banner", async (req, res, next) => {
    try {
        const {premiumBanner} = req.body;

        const result = await CMSCollection.findOneAndUpdate({CMSName: "harltze"}, {
            premiumBanner
        }, {new: true});
        
        res.send({result});
    } catch (error) {
        next(error);
    }
});

shopRoutes.put("/cms/gallery-banner", async (req, res, next) => {
    try {
        const {galleryBanner} = req.body;

        const result = await CMSCollection.findOneAndUpdate({CMSName: "harltze"}, {
            galleryBanner
        }, {new: true});
        
        res.send({result});
    } catch (error) {
        next(error);
    }
});

shopRoutes.put("/cms/contact-us", async (req, res, next) => {
    try {
        const {contactUs} = req.body;

        const result = await CMSCollection.findOneAndUpdate({CMSName: "harltze"}, {
            contactUs
        }, {new: true});
        
        res.send({result});
    } catch (error) {
        next(error);
    }
});

shopRoutes.put("/cms/affiliate-percentage", roleBasedAccess(["admin"]), async (req, res, next) => {
    try {
        const {defaultAffiliatePercent} = req.body;

        if(defaultAffiliatePercent < 0 || defaultAffiliatePercent >= 100) {
            res.status(400).send({
                message: "Invalid affiliate percentage"
            });
            return;
        }

        const result = await CMSCollection.findOneAndUpdate({CMSName: "harltze"}, {
            defaultAffiliatePercent
        }, {new: true});
        
        res.send({result});
    } catch (error) {
        next(error);
    }
});

shopRoutes.put("/cms/about-us", async (req, res, next) => {
    try {
        const {aboutUs} = req.body;

        const result = await CMSCollection.findOneAndUpdate({CMSName: "harltze"}, {
            aboutUs
        }, {new: true});
        
        res.send({result});
    } catch (error) {
        next(error);
    }
});

shopRoutes.put("/cms/affiliate", async (req, res, next) => {
    try {
        const {affiliate} = req.body;

        const result = await CMSCollection.findOneAndUpdate({CMSName: "harltze"}, {
            affiliate
        }, {new: true});
        
        res.send({result});
    } catch (error) {
        next(error);
    }
});

shopRoutes.put("/cms/social-media-handles", async (req, res, next) => {
    try {
        const {socialMedia} = req.body;

        const result = await CMSCollection.findOneAndUpdate({CMSName: "harltze"}, {
            socialMedia
        }, {new: true});
        
        res.send({result});
    } catch (error) {
        next(error);
    }
});

shopRoutes.put("/cms/copyright-footer", async (req, res, next) => {
    try {
        const {copyrightFooter} = req.body;

        const result = await CMSCollection.findOneAndUpdate({CMSName: "harltze"}, {
            copyrightFooter
        }, {new: true});
        
        res.send({result});
    } catch (error) {
        next(error);
    }
});

shopRoutes.get("/subscribers", async (req, res, next) => {
    try {
        const subscribers = await subscribersCollection.find();
        res.send({subscribers});
    } catch (error) {
        next(error);
    }
});

export default shopRoutes;
