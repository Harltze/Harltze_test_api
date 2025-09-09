import { Response, Router, Request } from "express";
import { multerUpload } from "../../utils/cloudinaryUtils";
import { uploadFile } from "../../controllers/fileController/fileUpload";

const fileRoutes = Router();

// Product routes
fileRoutes.post("/upload", multerUpload.single("file"), async (req: Request, res: Response) => {
    const response = await uploadFile(req.file);
    res.status(response.status).send(response);
}); 

export default fileRoutes;
