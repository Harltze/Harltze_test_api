import { ControllerResponseInterface } from "../../interfaces/responseInterface";
import { galleryCollection } from "../../models/Gallery";

export async function getGalleryPictures(page: number, limit: number): Promise<ControllerResponseInterface> {
    try {
        
        const pictures = await galleryCollection.paginate({}, {
            page, limit, sort: {createdAt: -1}
        });

        return {
            result: pictures,
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