import "dotenv/config";
import express from "express";
import path from "path";
import createError from "http-errors";
import mongoose from "mongoose";
import tenantRouter from "./app/routes/v1/customers";
import authRouter from "./app/routes/v1/authentication";
import agentAndLandlordRouter from "./app/routes/v1/shop";
import paystackRouter from "./app/routes/v1/paystackWebHook";
import cors from "cors";
import logger from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
// import { ExtendedError } from "socket.io/dist/namespace";
import { hashPassword, verifyJWT } from "./app/utils/authUtilities";
import { DecodedObject } from "./app/middleware/authenticatedUsersOnly";
import { customerCollection } from "./app/models/Customers";
import { chatCollection } from "./app/models/Chats";
import customerRoutes from "./app/routes/v1/customers";
import shopRoutes from "./app/routes/v1/shop";
import adminRoutes from "./app/routes/v1/admin";
import sharedRoutes from "./app/routes/v1/shared";
import fileRoutes from "./app/routes/v1/files";
import fs from "fs";
import { shopPendingOrderById } from "./app/controllers/shops/orders/ordersController";
import { shopCollection } from "./app/models/Shops";
import { productCollection } from "./app/models/Products";
import { uploadBase64Image } from "./app/utils/cloudinaryUtils";
import { CMSCollection } from "./app/models/CMSModel";
import { title } from "process";
// import { execSync } from "child_process"

var app: express.Application = express();

app.use(cors({
  origin: ["http://localhost:5173"],
    methods: ["POST", "GET", "PUT", "PATCH", "OPTIONS"],
}));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET", "PUT", "PATCH", "OPTIONS"],
  },
});

const port = process.env.PORT || "3000";

mongoose
  .connect(`${process.env.MONGO}`)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error) => {
    console.log(error);
  });

io.use((socket, next) => {
  try {
    console.log("Hereeeeeeeeeeeeeeee");
    const auth = socket.handshake.headers.authorization as string;

    const splittedAuth = auth.split(" ");

    console.log(splittedAuth);

    if (splittedAuth[0] != "Bearer") {
      io.send("Invalid auth header");
      return;
    }

    const decoded = verifyJWT(splittedAuth[1]);
    console.log("decoded", decoded);
    socket.handshake.auth.credentials = decoded;
    next();
  } catch (error: any) {
    console.log(error);
    next(error);
  }
});

io.on("connection", async (socket) => {
  console.log("Welcome", socket.handshake.auth.credentials);

  socket.send("Connected!");

  let userDetails: DecodedObject =
    socket.handshake.auth.credentials.userDetails;
  console.log(userDetails, "with socket id", socket.id, "just joined");

  socket.join(userDetails.userId);

  if (userDetails.role == "customer") {
    await customerCollection.findByIdAndUpdate(userDetails.userId, {
      isOnline: true,
    });
  } else if (userDetails.role == "shop") {
    await shopCollection.findByIdAndUpdate(userDetails.userId, {
      isOnline: true,
    });
  }

  // await chatCollection.updateMany({userId: userDetails.userId}, {
  //   isOnline: true
  // });

  // const chats = await chatCollection.find({userId: userDetails.userId});

  // const chatIds = chats.map(c => (c.me).toString());

  // console.log("chatIds", chatIds);

  // socket.to(chatIds).emit("new-presence-status", {
  //   userId: userDetails.userId,
  //   isOnline: true
  // });

  // if (userDetails.role == "buyer") {

  // } else if (userDetails.role == "shopper") {

  //   await shopperCollection.findByIdAndUpdate(
  //     userDetails.userId,
  //     { isOnline: true }
  //     );

  //   const assignedOrder = await orderCollection.findOne({
  //     assignedShopperId: userDetails.userId,
  //       $nor: [{orderStatus:"order-placed"}, {orderStatus:"delivery-confirmed"}],
  //   }).populate("shopId", "businessName logo streetAddress lga state");

  //   if(assignedOrder) {
  //     await shopperCollection.findByIdAndUpdate(userDetails.userId, {isAssigned: true});
  //     socket.leave((userDetails.userId).toString());
  //   }
  // } else if (userDetails.role == "shopAdmin" || userDetails.role == "staff") {

  //   await shopAdminCollection.findByIdAndUpdate(userDetails.userId, {
  //     isOnline: true,
  //   });
  //   socket.join(userDetails?.shopId as string);
  // }

  socket.on("disconnect", async (_reason) => {
    socket.leave(userDetails.userId);

    await customerCollection.findByIdAndUpdate(userDetails.userId, {
      isOnline: false,
    });

    await chatCollection.updateMany(
      { userId: userDetails.userId },
      {
        isOnline: false,
      }
    );

    const chats = await chatCollection.find({ userId: userDetails.userId });

    const chatIds = chats.map((c) => c.me.toString());

    socket.to(chatIds).emit("new-presence-status", {
      userId: userDetails.userId,
      isOnline: false,
    });

    // if (userDetails.role == "buyer") {

    // } else if (userDetails.role == "shopper") {

    //   await shopperCollection.findByIdAndUpdate(
    //     userDetails.userId,
    //     { isOnline: false }
    //     );

    // } else if (userDetails.role == "shopAdmin" || userDetails.role == "staff") {

    //   await shopAdminCollection.findByIdAndUpdate(userDetails.userId, {
    //     isOnline: false,
    //   });
    // }
  });
});

io.engine.on("connection_error", (err) => {
  console.log("Error", err);
  io.send(err);
});

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res: any, next) => {
  res.io = io;
  next();
});

app.use("/v1/file", fileRoutes);
app.use("/v1/customer", customerRoutes);
app.use("/v1/shop", shopRoutes);
app.use("/v1/admin", adminRoutes);
app.use("/v1/shared", sharedRoutes);
app.use("/v1/paystack", paystackRouter);
// app.use("/v1/landlordandagent", agentAndLandlordRouter);

app.get("/", (req, res) => {
  res.send("I'm healthy");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (
  err: any,
  req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  console.log(err);

  // for(let k in err) {
  //   console.log(k);
  // }

  // console.log(err.title);

  // send the error
  res.status(err.status || 500).json({
    successful: false,
    errorMessage: err.message
      ? err.message
      : "An internal server error has occurred",
  });

  // if (err.kind) {
  //   res.status(400).json({
  //     successful: false,
  //     errorMessage: err.message,
  //   });
  // } else if (err.status) {
  //   res.status(err.status).json({
  //     successful: false,
  //     errorMessage: err.message,
  //   });
  // } else if (err.errors) {
  //   res.status(400).json({
  //     successful: false,
  //     errorMessage: err._message ? err._message : err.message,
  //   });
  // } else if (err.isJoi) {
  //   res.status(400).json({
  //     successful: false,
  //     errorMessage: err.message,
  //   });
  // } else {

  // }
});

httpServer.listen(port, async () => {
  const directoryName = "public";

  const directoryPath = path.join(__dirname, directoryName);

  // Create the directory ///////////////////////
  fs.mkdir(directoryPath, { recursive: true }, (err) => {
    if (err) {
      return console.error(`Error creating directory: ${err.message}`);
    }
    console.log(`Directory '${directoryName}' created successfully!`);
  });
  ////////////////////////////////////////////////

  const cmsExists = await CMSCollection.findOne({
    CMSName: "harltze",
  });

  if (!cmsExists) {
    await CMSCollection.create({
      CMSName: "harltze",
      hero: [
        {
          pictureURL:
            "https://fun-bucket.fly.storage.tigris.dev/1752304191798.png",
          header: "Inspired by legacy, built for the future.",
          description: "Welcome to HARLTZE.",
          linkButtonTitle: "SHOP COLLECTIONS",
          linkButtonUrl: "/products",
        },
        {
          pictureURL:
            "https://fun-bucket.fly.storage.tigris.dev/1752304191777.png",
          header: "Inspired by legacy, built for the future.",
          description: "Welcome to HARLTZE.",
          linkButtonTitle: "SHOP COLLECTIONS",
          linkButtonUrl: "/products",
        },
      ],
      termsAndConditions: {
        type: [
          {
            title: "",
            description: "",
          },
        ],
      },
      privacyPolicy: {
        type: [
          {
            title: "",
            description: "",
          },
        ],
      },
      cancellationPolicy: {
        type: [
          {
            title: "",
            description: "",
          },
        ],
      },
      faqs: {
        type: [
          {
            question: "",
            answer: "",
          },
        ],
      },
      footer: [
        {
          title: "Account",
          links: [
            {
              title: "Account",
              link: "",
            },
            {
              title: "Order History",
              link: "",
            },
            {
              title: "Become an Affiliate",
              link: "",
            },
          ],
        },
        {
          title: "Assistance",
          links: [
            {
              title: "Return Policy",
              link: "",
            },
            {
              title: "Cancellation Policy",
              link: "",
            },
            {
              title: "Terms & Conditions",
              link: "",
            },
            {
              title: "Privacy Policy",
              link: "",
            },
            {
              title: "FAQs",
              link: "",
            },
          ],
        },
        {
          title: "Have a question or want to collaborate",
          links: [
            {
              title: "Tiktok",
              link: "",
            },
            {
              title: "Facebook",
              link: "",
            },
            {
              title: "X",
              link: "",
            },
            {
              title: "Instagram",
              link: "",
            },
            {
              title: "Youtube",
              link: "",
            },
          ],
        },
      ],
      socialMedia: [
        {
          title: "Instagram",
          link: "https://instagram.com",
          iconLink: "https://linktoicon.com",
        },
      ],
      promotionBanner: [
        {
          title: "",
          link: "",
          show: false,
        },
      ],
      copyrightFooter: {
        title: "Harltze. All rights reserved.",
        description: "Designed with love by Harltze, developed by Victor Ukok",
      },
    });
  }

  // const products = await productCollection.find({});

  // for (let product of products) {

  //   const riderQrCode = (await uploadBase64Image(product!!.riderQrCode!!)).secure_url;
  //   const customerQrCode = (await uploadBase64Image(product!!.customerQrCode!!)).secure_url;

  //   await productCollection.findByIdAndUpdate(product._id, {
  //     customerQrCode,
  //     riderQrCode
  //   });

  // }

  console.log(`TypeScript with Express http://localhost:${port}/`);
});

export { io, httpServer, port };
