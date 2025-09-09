import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { mealCategoryCollection } from "../../../models/MealCategories";
import { productCollection } from "../../../models/Products";
import { slugToText, textToSlug } from "../../../utils/textSlugUtil";

export const addNewCategory = async (name: string, clotheCollection: string, type: string): Promise<ControllerResponseInterface> => {
    try {
        
        const alreadyExist = await mealCategoryCollection.findOne({name, type});

        if(alreadyExist) {
            return {
                result: "Category already exist in the collection",
                status: 409
            };
        }

        await mealCategoryCollection.create({
            name, clotheCollection, type, slug: textToSlug(name)
        });

        return {
            result: "Category created successfully",
            status: 201
        };

    } catch (error: any) { 
        console.log(error);
        return {
            result: null,
            status: error.status || 500,
            error,
          };
    }
}

export const updateCategory = async (categoryId: string, collectionId: string, name: string): Promise<ControllerResponseInterface> => {
    try {

        const categoryDetails = await mealCategoryCollection.findOne({
            name, _id: {$ne: categoryId},
            clotheCollection: collectionId
        });

        if(categoryDetails) {
            return {
                result: "Category already exist. Duplicate category name not allowed",
                status: 409
            }
        }

        const updatedCategory = await mealCategoryCollection.findByIdAndUpdate(categoryId, {
            name, slug: textToSlug(name)
        }, {
            new: true
        });

        return {
            result: updatedCategory,
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

export const deleteCategory = async (categoryId: string): Promise<ControllerResponseInterface> => {
    try {
        
        const productCount = await productCollection.countDocuments({categories: {$in: categoryId}});


        if(productCount > 0) {
            return {
                result: null,
                error: `Can't delete this category at this time. Category is used by ${productCount} product(s)`,
                details: `This category can't be deleted as it us used by ${productCount} products(s)`,
                status: 401
            };
        }

        const deletedCategory = await mealCategoryCollection.findByIdAndDelete(categoryId);

        return {
            result: deletedCategory,
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
