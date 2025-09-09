import request from "supertest";
import mongoose from "mongoose";
import { OTPCollection } from "../app/models/OtpManager";
import { httpServer } from "../app";
import path from "path";
import { shopCollection } from "../app/models/Shops";
import { customerCollection } from "../app/models/Customers";
import { productCollection } from "../app/models/Products";
import { favouriteProductCollection } from "../app/models/FavouriteProducts";
import { favouriteShopCollection } from "../app/models/FavouriteShops";


let shopauth: string;

let customerauth: string;


beforeAll(async() => {
    await shopCollection.deleteMany({});
    await customerCollection.deleteMany({});
    await OTPCollection.deleteMany({});
    await productCollection.deleteMany({});
    await favouriteProductCollection.deleteMany({});
    await favouriteShopCollection.deleteMany({});
});

afterAll(async () => {
    httpServer.close();
    await mongoose.disconnect();
});

describe("Test for the auth routes for Customers", () => {
    
    test("Register a new customer named Victor Ukok", async () => {
        const response = await request(httpServer)
        .post("/v1/customer/register")
        .send({
            firstName: "Victor",
            lastName: "Ukok",
            phoneNumber: "08137249484",
            email: "ukokjnr+customer@gmail.com",
            secondaryEmail: "ukokjnr+customer@gmail.com",
            profilePic: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREknGfbkHfOwvbqLPIxOf_5S_j-tWYPRgtpHiLVyA75Cmb5cj2tuPfiaa14Pcem4IReOA",
            country: "Nigeria",
            state: "akwa_ibom",
            city: "Uyo",
            address: "10 Nwaniba road, Uyo",
            password: "testaccount"
        });

        expect(response.status).toBe(201);
        expect(response.body.result).toBe("User created successfully");
    });

    test("Log Victor Ukok in", async () => {
        const response = await request(httpServer)
        .post("/v1/customer/login")
        .send({
            email: "ukokjnr+customer@gmail.com",
            password: "testaccount"
        });

        customerauth = response.body.result;

        expect(response.status).toBe(200);
        expect(typeof(response.body.result)).toBe("string");
        expect(response.body.details.email).toBe("ukokjnr+customer@gmail.com");
        expect(response.body.details.role).toBe("customer");
    });   
});



describe("Test the auth routes for Shop", () => {
    
    test("Register Vicky's Delight shop", async () => {
        const response = await request(httpServer)
        .post("/v1/shop/register")
        .send({
            firstName: "Victor",
            lastName: "Ukok",
            shopName: "Vicky's Delight",
            shopLogo: "https://thumbs.dreamstime.com/b/lets-shopping-logo-design-template-shop-icon-135610500.jpg",
            shopPictures: ["https://www.shopfrontdesign.co.uk/uploads/slider/Boss_Shop_Front.jpg"],
            ownerPictures: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDhs1Z5SSVqH0w_4S8R4lnTj0O7Swn4NA5tA&s"],
            shopAddress: "40 Nwaniba road, Uyo",
            phoneNumber: "08137249484",
            email: "ukokjnr+shop@gmail.com",
            secondaryEmail: "ukokjnr+customer@gmail.com",
            country: "Nigeria",
            state: "akwa_ibom",
            city: "Uyo",
            password: "testaccount"
        });

        expect(response.status).toBe(201);
        expect(response.body.result).toBe("Shop created successfully");
    });

    test("Log Vicky's Delight shop in", async () => {
        const response = await request(httpServer)
        .post("/v1/shop/login")
        .send({
            email: "ukokjnr+shop@gmail.com",
            password: "testaccount"
        });

        shopauth = response.body.result;

        expect(response.status).toBe(200);
        expect(typeof(response.body.result)).toBe("string");
        expect(response.body.details.email).toBe("ukokjnr+shop@gmail.com");
        expect(response.body.details.role).toBe("shop");
    });   
});


describe("Test upload of products on vicky's shop", () => {
    

    test("Add rice and stew under grain's category", async () => {
        const response = await request(httpServer)
        .post("/v1/shop/shop-product")
        .set("Authorization", `Bearer ${shopauth}`)
        .send({
            productName: "Fried rice and chicken",
            description: "Here is a plate of delicious fried rice",
            pictures: [
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_rlN-2Lzgejk9KJ131Wic-XRYeVREDOTTXQ&s",
                "https://www.sweetnspicee.com/wp-content/uploads/2020/11/LEY_1301-scaled.jpg"
            ],
            cost: 4000,
            categories: ["6755ea57e29a3531a8abb1bf"],
        });

        expect(response.status).toBe(201);
        expect(response.body.result).toBe("Product created successfully");
    });

    test("Add meatpie", async () => {
        const response = await request(httpServer)
        .post("/v1/shop/shop-product")
        .set("Authorization", `Bearer ${shopauth}`)
        .send({
            productName: "Meat pie",
            description: "Here is a plate of delicious meat pie",
            pictures: [
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbxOPNuguJC2CBLx_8g3JtNJOq1LSjZYnPqg&s",
                "https://i.pinimg.com/736x/ef/ce/eb/efceeb75bd1ccac0385f3dafc32600d3.jpg"
            ],
            cost: 1200,
            categories: ["6755ec43e29a3531a8abb1cb"],
        });

        expect(response.status).toBe(201);
        expect(response.body.result).toBe("Product created successfully");
    });
    
    test("Add fish pie", async () => {
        const response = await request(httpServer)
        .post("/v1/shop/shop-product")
        .set("Authorization", `Bearer ${shopauth}`)
        .send({
            productName: "Fish pie",
            description: "Here is a plate of delicious meat pie",
            pictures: [
                "https://img-global.cpcdn.com/recipes/616be6608363d692/680x482cq70/fish-pie-recipe-main-photo.jpg",
                "https://img-global.cpcdn.com/recipes/12cb6d04d4b53d4a/680x482cq70/baked-fish-pie-recipe-main-photo.jpg"
            ],
            cost: 1000,
            categories: ["6755ec43e29a3531a8abb1cb"],
        });

        expect(response.status).toBe(201);
        expect(response.body.result).toBe("Product created successfully");
    });


    test("Trying to add a duplicate product", async () => {
        const response = await request(httpServer)
        .post("/v1/shop/shop-product")
        .set("Authorization", `Bearer ${shopauth}`)
        .send({
            productName: "Fish pie",
            description: "Here is a plate of delicious meat pie",
            pictures: [
                "https://img-global.cpcdn.com/recipes/616be6608363d692/680x482cq70/fish-pie-recipe-main-photo.jpg",
                "https://img-global.cpcdn.com/recipes/12cb6d04d4b53d4a/680x482cq70/baked-fish-pie-recipe-main-photo.jpg"
            ],
            cost: 1000,
            categories: ["6755ec43e29a3531a8abb1cb"],
        });

        expect(response.status).toBe(409);
        expect(response.body.error).toBe("A product already exist with this product name");
    });

});

describe("Test user viewing products and shops", () => {
    test("View home", async () => {
        const response = await request(httpServer)
        .get("/v1/customer/home")
        .set("Authorization", `Bearer ${customerauth}`);

        expect(response.status).toBe(200);
    });

    test("View meals nearby", async () => {
        const response = await request(httpServer)
        .get("/v1/customer/meals-nearby/1/10")
        .set("Authorization", `Bearer ${customerauth}`);

        expect(response.status).toBe(200);
    });

    test("View meatpie", async () => {

        const meatPieDetails = await productCollection.findOne({productName: "Meat pie"});

        const response = await request(httpServer)
        .get(`/v1/customer/meal-details/${meatPieDetails?.id}`)
        .set("Authorization", `Bearer ${customerauth}`);

        console.log(response.body);

        expect(response.status).toBe(200);
    });

    test("View shops nearby", async () => {
        const response = await request(httpServer)
        .get("/v1/customer/shops-nearby/1/10")
        .set("Authorization", `Bearer ${customerauth}`);

        expect(response.status).toBe(200);
    });

    test("View Vicky's delight", async () => {

        const vickysDelightShop = await shopCollection.findOne({firstName: "Victor"});

        const response = await request(httpServer)
        .get(`/v1/customer/shop-details/${vickysDelightShop?.id}`)
        .set("Authorization", `Bearer ${customerauth}`);

        expect(response.status).toBe(200);
    });
});

describe("Adding and removing a shop and meal from favourite", () => {

    test("Add meatpie to favourite meals", async () => {

        const meatPieDetails = await productCollection.findOne({productName: "Meat pie"});

        const response = await request(httpServer)
        .put(`/v1/customer/favourite-meals/${meatPieDetails?.id}`)
        .set("Authorization", `Bearer ${customerauth}`);

        expect(response.status).toBe(201);
    });

    test("Add Vicky's Delight to favourite shops", async () => {

        const vickysDelightShop = await shopCollection.findOne({firstName: "Victor"});

        const response = await request(httpServer)
        .put(`/v1/customer/favourite-shops/${vickysDelightShop?.id}`)
        .set("Authorization", `Bearer ${customerauth}`);

        expect(response.status).toBe(201);
    });
});
