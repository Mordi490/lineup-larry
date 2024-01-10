import { S3 } from "@aws-sdk/client-s3";
import { env } from "../../../app/env";

// init && conf s3 client
export const myS3Client = new S3({
  credentials: {
    accessKeyId: env.AWS_IAM_USER_KEY,
    secretAccessKey: env.AWS_IAM_USER_SECRET,
  },
  region: env.AWS_S3_REGION,
});
