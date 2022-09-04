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

// given a key, creates a presigned url that you can POST/PUT data into
export const createPresingdPost = (key: string) => {
  return new Promise((resolve, reject) => {
    s3.createPresignedPost(
      {
        Fields: {
          Key: key,
        },
        Expires: 90,
        Bucket: process.env.BUCKET_NAME,
        Conditions: [
          ["starts-with", "$Content-Type", "image/"], // whitelist images for now
          ["content-length-range", 0, 18000000], // 18 mb
        ],
      },
      (err, signed) => {
        if (err) return reject(err);
        resolve(signed);
      }
    );
  });
};
