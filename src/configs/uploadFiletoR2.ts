import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * Uploads an image to Cloudflare R2 and returns the public URL.
 * @param fileBuffer - The image file as a buffer.
 * @param fileType - The image MIME type (e.g. 'image/png').
 * @returns The public URL of the uploaded image.
 */
export async function uploadImageToR2(
  fileBuffer: Buffer,
  fileType: string
): Promise<string> {
  const fileName = `${randomUUID()}.${fileType.split("/")[1]}`;

  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: fileName,
    Body: fileBuffer,
    ContentType: fileType,
  });

  await R2.send(uploadCommand);

  const publicUrl = `https://pub-36d2b418b9204c179793e36c0e125419.r2.dev/coachdesk/${fileName}`;
  return publicUrl;
}
