import { ControllerResponseInterface } from "../../interfaces/responseInterface";
import { clothesCollection } from "../../models/ClothesCollections";
import { mealCategoryCollection } from "../../models/MealCategories";

export const getCategories = async (params: any): Promise<ControllerResponseInterface> => {
    try {

        const query: any = {};

        if(params.collectionId) {
            query.clotheCollection = params.collectionId;
        }

        if(params.productOrStudio) {
            query.type = params.productOrStudio;
        }
        
        const categories = await mealCategoryCollection.find(query).populate("clotheCollection");
        return {
            result: categories,
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

export const getCollections = async (params: any): Promise<ControllerResponseInterface> => {
    try {

        const query: any = {};

        if(params.type) {
            query.type = params.type;
        }
        
        const clothesCollections = await clothesCollection.find(query);

        return {
            result: clothesCollections,
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