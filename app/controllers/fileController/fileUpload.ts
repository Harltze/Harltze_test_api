import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../../middleware/authenticatedUsersOnly";
import { uploadToCloudinary } from "../../utils/cloudinaryUtils";
import { ControllerResponseInterface } from "../../interfaces/responseInterface";
import { uploadObjectFromFS } from "../../utils/AWSFileUploadUtil";
import fs from "fs";

export async function uploadFile (file: any): Promise<ControllerResponseInterface> {
    try {
      // const resp = await uploadToCloudinary(file!!.path);

      const result = await uploadObjectFromFS(file!!.path, file!!.mimetype);

      console.log("res", result);

      return {
        result: result,
        details: "Upload Successful",
        status: 200,
        error: null
      };

    } catch (error) {
        console.log(error);
        return {
            result: null,
            status: 500,
            error
          };
    } finally {
      fs.unlinkSync(file!!.path);
    }
  }