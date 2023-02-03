import { S3 } from "aws-sdk/";
import { env } from "../env/server.mjs";

// init && conf s3 client
export const s3 = new S3({
  credentials: {
    accessKeyId: env.AWS_IAM_USER_KEY as string,
    secretAccessKey: env.AWS_IAM_USER_SECRET as string,
  },
  region: env.AWS_S3_REGION as string,
  signatureVersion: "v4",
});
