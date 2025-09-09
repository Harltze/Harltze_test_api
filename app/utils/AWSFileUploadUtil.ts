import {
    S3Client,
    paginateListBuckets,
    paginateListObjectsV2,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { readFile } from "node:fs/promises";
import "dotenv/config";
import { v4 } from "uuid";






const S3 = new S3Client({
    region: process.env.AWS_REGION as string,
    endpoint: process.env.AWS_ENDPOINT_URL_S3 as string,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
    }
  });

export const uploadObjectFromFS = async (filePath: string, fileType: string) => {

    const key = v4()  + "." + fileType.split("/")[1];

    const command = new PutObjectCommand({
        Bucket: process.env.BUCKET,
        Key: key,
        Body: await readFile(filePath),
    });

    const response = await S3.send(command);

    const [https, flyiolink] = (process.env.AWS_ENDPOINT_URL_S3 as string).split("//");

    const fileUrl = `${https}//${process.env.BUCKET}.${flyiolink}/${key}`;

    return {statusCode: response.$metadata.httpStatusCode, fileUrl};

}