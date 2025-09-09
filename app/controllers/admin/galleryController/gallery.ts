import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { galleryCollection } from "../../../models/Gallery";

export async function adminAddGallery(pictureURL: string, title: string, description: string): Promise<ControllerResponseInterface>  {
    try {
        const newPictures = await galleryCollection.create({
            pictureURL, title, description
        });

        return {
            result: "Gallery picture created successfully",
            details: newPictures,
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

export async function adminUpdateGallery(id: string, pictureURL: string, title: string, description: string): Promise<ControllerResponseInterface>  {
    try {
        
        const updatedPicture = await galleryCollection.findByIdAndUpdate(id, {
            pictureURL, title, description
        }, {new: true});

        return {
            result: "Gallery picture updated successfully",
            details: updatedPicture,
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

export async function adminDeleteGallery(id: string): Promise<ControllerResponseInterface>  {
    try {

        const deletedPicture = await galleryCollection.findByIdAndDelete(id);

        return {
            result: "Gallery picture deleted successfully",
            details: deletedPicture,
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
