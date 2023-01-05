import { S3 } from "aws-sdk/";

// init && conf s3 client
export const s3 = new S3({
  credentials: {
    accessKeyId: process.env.IAM_USER_KEY as string,
    secretAccessKey: process.env.IAM_USER_SECRET as string,
  },
  region: process.env.S3_REGION as string,
  signatureVersion: "v4",
});
