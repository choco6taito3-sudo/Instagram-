import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.S3_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
});

export async function uploadMedia(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const key = `uploads/${randomUUID()}-${filename}`;
  const bucket = process.env.S3_BUCKET;

  if (!bucket || !process.env.S3_ACCESS_KEY) {
    const base64 = file.toString("base64");
    return `data:${contentType};base64,${base64}`;
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: "public-read",
    })
  );

  const publicUrl = process.env.S3_PUBLIC_URL;
  return publicUrl ? `${publicUrl}/${key}` : `https://${bucket}.s3.amazonaws.com/${key}`;
}
