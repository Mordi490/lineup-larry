import { S3 } from "@aws-sdk/client-s3"
import { env } from "../../../env/server.mjs";

// init && conf s3 client
export const s3 = new S3({
  credentials: {
    accessKeyId: env.AWS_IAM_USER_KEY,
    secretAccessKey: env.AWS_IAM_USER_SECRET,
  },
  region: env.AWS_S3_REGION,
});
