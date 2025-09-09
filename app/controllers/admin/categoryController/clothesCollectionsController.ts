import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { clothesCollection } from "../../../models/ClothesCollections";
import { mealCategoryCollection } from "../../../models/MealCategories";
import { productCollection } from "../../../models/Products";
import { slugToText, textToSlug } from "../../../utils/textSlugUtil";

export const addCollection = async (name: string, type: string): Promise<ControllerResponseInterface> => {
    try {
        
        const alreadyExist = await clothesCollection.findOne({name, type});

        if(alreadyExist) {
            return {
                result: "Category already exist",
                status: 409
            };
        }

        await clothesCollection.create({
            name, type, slug: textToSlug(name)
        });

        return {
            result: "Collection created successfully",
            status: 201
        };

    } catch (error: any) {
        return {
            result: null,
            status: error.status || 500,
            error,
          };
    }
}

export const updateCollection = async (collectionId: string, name: string, type: string): Promise<ControllerResponseInterface> => {
    try {

        const collectionDetails = await clothesCollection.findOne({
            name, _id: {$ne: collectionId}
        });

        if(collectionDetails) {
            return {
                result: "Collection already exist. Duplicate category name not allowed",
                status: 409
            }
        }

        const updatedCollection = await clothesCollection.findByIdAndUpdate(collectionId, {
            name, slug: textToSlug(name), type
        }, {
            new: true
        });

        await mealCategoryCollection.updateMany({clotheCollection: collectionId}, {
            type
        });

        await productCollection.updateMany({clothesCollections: [collectionId]}, {
            stockStatus: type == "studio" ? "archived" : "in-stock",
        });

        return {
            result: updatedCollection,
            status: 200
        };
        
    } catch (error: any) {
        return {
            result: null,
            status: error.status || 500,
            error,
          };
    }
}

export const deleteCollection = async (collectionId: string): Promise<ControllerResponseInterface> => {
    try {
        
        const productCount = await productCollection.countDocuments({clothesCollections: {$in: collectionId}});


        if(productCount > 0) {
            return {
                result: null,
                error: `Can't delete this collection at this time. Category is used by ${productCount} product(s)`,
                details: `This collection can't be deleted as it us used by ${productCount} products(s)`,
                status: 401
            };
        }

        const deletedCollection = await clothesCollection.findByIdAndDelete(collectionId);

        return {
            result: deletedCollection,
            status: 200,
            error: null
        };

    } catch (error: any) {
        return {
            result: null,
            status: error.status || 500,
            error,
          };
    }
}
