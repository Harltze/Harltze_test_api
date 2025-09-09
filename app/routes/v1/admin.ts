import { Response, Router, NextFunction, response, Request } from "express";
import { authenticatedUsersOnly, CustomRequest, CustomResponse } from '../../middleware/authenticatedUsersOnly';

import { addNewCategory, deleteCategory, updateCategory } from "../../controllers/admin/categoryController/categoryController";
import { adminAddAdvert, adminDeleteAdvert, adminGetAllAdverts, adminUpdateAdvert, adminViewAdvert } from "../../controllers/admin/advertController/advert";
import { updateProduct } from "../../controllers/shops/products/productsController";
import roleBasedAccess from "../../middleware/roleBasedAccess";
import { adminAddGallery, adminUpdateGallery } from "../../controllers/admin/galleryController/gallery";
import { addWorker, deleteWorker, editWorker, getWorkers, registerAffiliate } from "../../controllers/admin/workerManager";
import { shopCollection } from "../../models/Shops";
import { v4 } from "uuid";
import { nanoid } from "nanoid";
import { addCollection, deleteCollection, updateCollection } from "../../controllers/admin/categoryController/clothesCollectionsController";

const adminRoutes = Router();


adminRoutes.use(authenticatedUsersOnly);
adminRoutes.use(roleBasedAccess(["admin"]));

adminRoutes.post("/affiliate/register", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const {
        firstName,
        lastName,
        phoneNumber,
        email,
    } = req.body;

    console.log("Hereeee");

    const password = nanoid(8);

    const {status, ...response} = await registerAffiliate(
        req.userDetails?.userId!!, firstName, lastName, phoneNumber, email, password
    );
    res.status(status).send(response);
});

// Category routes routes
adminRoutes.post("/category", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await addNewCategory(req.body.name, req.body.clotheCollection, req.body.type);
    res.status(response.status).send(response);
});

adminRoutes.put("/category/:categoryId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await updateCategory(req.params.categoryId, req.params.collectionId, req.body.name);
    res.status(response.status).send(response);
});

adminRoutes.delete("/category/:categoryId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await deleteCategory(req.params.categoryId);
    res.status(response.status).send(response);
});

// Clothes collections

adminRoutes.post("/clothescollection", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await addCollection(req.body.name, req.body.type);
    res.status(response.status).send(response);
});

adminRoutes.put("/clothescollection/:collectionId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await updateCollection(req.params.collectionId, req.body.name, req.body.type);
    res.status(response.status).send(response);
});

adminRoutes.delete("/clothescollection/:collectionId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await deleteCollection(req.params.collectionId);
    res.status(response.status).send(response);
});

/// Adverts
adminRoutes.get("/adverts", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await adminGetAllAdverts();
    res.status(response.status).send(response);
});

adminRoutes.get("/adverts/:id", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await adminViewAdvert
    (req.params.id);
    res.status(response.status).send(response);
});

adminRoutes.post("/advert", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await adminAddAdvert(req.body);
    res.status(response.status).send(response);
});

adminRoutes.put("/advert/:advertId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    
    req.body.advertId = req.params.advertId
    
    const response = await adminUpdateAdvert(req.body);
    res.status(response.status).send(response);
});

// adminRoutes.put("/product/:productId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
//     const response = await updateProduct(req.params.productId, req.body);
//     res.status(response.status).send(response);
// });

adminRoutes.delete("/advert/:advertId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await adminDeleteAdvert(req.params.advertId);
    res.status(response.status).send(response);
});

adminRoutes.post("/gallery", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await adminAddGallery(req.body.pictureURL, req.body.title, req.body.description);
    res.status(response.status).send(response);
});

adminRoutes.post("/gallery/:id", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await adminUpdateGallery(req.params.id, req.body.pictureURL, req.body.title, req.body.description);
    res.status(response.status).send(response);
});

adminRoutes.delete("/gallery/:id", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const response = await adminDeleteAdvert(req.params.id);
    res.status(response.status).send(response);
});

adminRoutes.get("/workers/:type/:page/:limit", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const shopDetails = await shopCollection.findById(req.userDetails?.userId);
    if(!shopDetails) {
        res.status(404).send({
            result: null,
            error: "Admin not found"
        });
        return;
    }
    const {status, ...response} = await getWorkers(req.params.type, req.params.page, req.params.limit, shopDetails.shopUniqueId!!);
    res.status(status).send(response);
});

adminRoutes.get("/worker/:id", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const details = await shopCollection.findById(req.params.id);
    res.send({details});
});


adminRoutes.post("/workers", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {

    const shopDetails = await shopCollection.findById(req.userDetails?.userId);
    if(!shopDetails) {
        res.status(404).send({
            result: null,
            error: "Admin not found"
        });
        return;
    }
    const {status, ...response} = await addWorker(
        shopDetails.shopUniqueId!!,
        req.body.firstName,
        req.body.lastName,
        req.body.phoneNumber,
        req.body.email,
        req.body.role,
    );
    res.status(status).send(response);
});

adminRoutes.put("/workers/:recordId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const {recordId} = req.params;
    const {
        firstName,
        lastName,
        phoneNumber,
        role
    } = req.body;

    const {status, ...response} = await editWorker(req.userDetails?.userId!!, recordId, firstName, lastName, phoneNumber, role);
    res.status(status).send(response);
});

adminRoutes.delete("/workers/:recordId", async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    const {status, ...response} = await deleteWorker(req.userDetails?.userId!!, req.params.recordId);
    res.status(status).send(response);
});

export default adminRoutes;
