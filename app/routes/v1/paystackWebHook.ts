import { Request, Response, Router, NextFunction } from "express";
import axios from "axios";
import {
  CustomRequest,
  CustomResponse,
} from "../../middleware/authenticatedUsersOnly";
import crypto from "crypto";
import cors from "cors";
import _ from "mongoose-paginate-v2";
import { propertyOrderCollection } from "../../models/PropertyOrders";
import moment from "moment";
import { orderCollection } from "../../models/Orders";
import { customerCollection } from "../../models/Customers";

const paystackRouter = Router();

const whitelist = ["52.31.139.75", "52.49.173.169", "52.214.14.220"]; // Example IPs

// CORS options
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    // Check if the origin is in the whitelist
    if (whitelist.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "POST",
  allowedHeaders: "Content-Type,Authorization",
};

paystackRouter.post(
  "/webhook",
  cors(corsOptions),
  async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    try {
      const hash = crypto
        .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY as string)
        .update(JSON.stringify(req.body))
        .digest("hex");
      if (hash == req.headers["x-paystack-signature"]) {
        // Retrieve the request's body
        const event = req.body;
        // Do something with event

        const reference = event.data.reference;

        const updatedOrder = await orderCollection.findOneAndUpdate(
          { paystackReference: reference },
          {
            orderStatus:
              event.data.status == "success" ? "paid" : "payment-failed",
          },
          { new: true }
        );

        const customerDetails = await customerCollection.findById(updatedOrder?.customerId);

        res.io?.to((customerDetails!!._id)?.toString()).emit("payment-event", updatedOrder);

        res.send(event);
      } else {
        res.status(400).send({
            message: "Invalid hook request."
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

paystackRouter.get(
  "/bank-list",
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await axios.get(
      "https://api.paystack.co/bank?country=nigeria",
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    res.send(response.data);
  }
);

paystackRouter.post("/verify-account", async (req: Request, res: Response, next: NextFunction) => {
  try {

    const {accountNumber, bankCode} = req.body;

    console.log(accountNumber, bankCode);
    
    const response = await axios.get(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    res.send(response.data);

  } catch (error) {
    next(error);
  }
});

export default paystackRouter;
