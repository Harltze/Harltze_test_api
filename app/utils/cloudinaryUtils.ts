import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import Datauri from "datauri";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
import fs from "fs";
import axios from "axios";

export type FileType = "image" | "video" | "raw" | "auto" | undefined;

/**
 * @description This function converts the buffer to data url
 * @param {Object} req containing the field object
 * @returns {String} The data url from the string buffer
 */
// export { multerUploads, dataUri };

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + "." + file.mimetype.split("/")[1]);
  },
});

const multerUpload = multer({ storage: storage });

async function uploadToCloudinary(
  fileOrFiles: string | Array<string>,
  fileType: FileType = "auto"
): Promise<any> {
  try {

    console.log("fileType", fileType);

    if (typeof fileOrFiles == "string") {
      const fileProps = await cloudinary.uploader.upload(fileOrFiles, {
        folder: fileType + "s",
        resource_type: fileType,
      });
      // await fs.unlink(fileOrFiles);
      return fileProps;
    } else if (typeof fileOrFiles == "object") {
      const filesProps: any = [];
      for (let i = 0; i < fileOrFiles.length; i++) {
        filesProps.push(
          await cloudinary.uploader.upload(fileOrFiles[i], {
            folder: fileType + "s",
            resource_type: fileType,
          })
        );
        // await fs.unlink(fileOrFiles[i]);
      }
      return filesProps;
    } else {
      return;
    }
  } catch (error) {
    console.log(error);
    return error;
  } finally {
    const files = fs.readdirSync("public");
    files
      .filter((f) => fs.statSync(path.join("public", f)).isFile())
      .forEach((file) => {
        const filePath = path.join("public", file);
        fs.unlinkSync(filePath);
      });
  }
}

async function uploadBase64Image(base64Image: string) {
  const cloudName = process.env.CLOUDINARY_NAME as string; // Replace with your Cloudinary cloud name
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET as string; // Replace with your upload preset

  // Strip the prefix "data:image/png;base64," if it exists
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

  // Prepare the form data
  const formData = new FormData();
  formData.append('file', `data:image/png;base64,${base64Data}`);
  formData.append('upload_preset', uploadPreset);

  try {
      const response = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
          },
      });

      return response.data
  } catch (error) {
      console.error('Error uploading image:', error);
      return null;
  }
}

async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "raw" | "video"
) {
  try {
    const result = await cloudinary.uploader.destroy(
      "trovi_images_test/" + publicId,
      {
        resource_type: resourceType,
      }
    );

    return result.result;
  } catch (error) {
    console.log(error);
    return "An error occurred";
  }
}

export { uploadToCloudinary, multerUpload, deleteFromCloudinary, uploadBase64Image };
