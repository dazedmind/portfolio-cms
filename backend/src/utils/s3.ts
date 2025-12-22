import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client with server-side credentials
const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_BUCKET_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const BUCKET_URL = process.env.AWS_S3_BUCKET_URL!;

/**
 * Upload a file to S3 from backend
 * @param fileBuffer - The file buffer
 * @param fileName - Original filename
 * @param mimeType - File MIME type
 * @param folder - Optional folder path
 * @returns The public URL of the uploaded file
 */
export const uploadToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folder: string = ""
): Promise<string> => {
  try {
    console.log("🚀 Starting S3 upload...");
    console.log("📁 Bucket:", BUCKET_NAME);
    console.log("📂 Folder:", folder);
    console.log("📄 File:", fileName);
    
    // Validate environment variables
    if (!BUCKET_NAME || !BUCKET_URL) {
      throw new Error("S3 bucket configuration missing. Check AWS_S3_BUCKET_NAME and AWS_S3_BUCKET_URL in .env");
    }
    
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = folder
      ? `${folder}/${timestamp}_${sanitizedFileName}`
      : `${timestamp}_${sanitizedFileName}`;

    console.log("🔑 S3 Key:", key);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await s3Client.send(command);

    const fileUrl = `${BUCKET_URL}/${key}`;
    console.log("✅ Upload successful:", fileUrl);
    return fileUrl;
  } catch (error: any) {
    console.error("❌ Error uploading to S3:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode,
    });
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

/**
 * Delete a file from S3
 * @param fileUrl - The full URL of the file to delete
 * @returns true if deletion was successful
 */
export const deleteFromS3 = async (fileUrl: string): Promise<boolean> => {
  try {
    const key = fileUrl.replace(`${BUCKET_URL}/`, "");

    if (!key || key === fileUrl) {
      console.error("Invalid S3 URL:", fileUrl);
      return false;
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw new Error("Failed to delete file from S3");
  }
};

