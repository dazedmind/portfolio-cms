import type { Handler, HandlerEvent } from '@netlify/functions';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import busboy from 'busboy';
import { validateAuth } from './utils/auth.js';
import { success, error, unauthorized, badRequest, handleCors } from './utils/response.js';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_BUCKET_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const BUCKET_URL = process.env.AWS_S3_BUCKET_URL!;

// Helper to parse multipart form data
async function parseMultipartForm(event: HandlerEvent): Promise<{ file?: { buffer: Buffer; filename: string; mimetype: string }; folder?: string }> {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: { 'content-type': event.headers['content-type'] || '' } });
    let file: { buffer: Buffer; filename: string; mimetype: string } | undefined;
    let folder: string | undefined;

    bb.on('file', (name, stream, info) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => {
        file = {
          buffer: Buffer.concat(chunks),
          filename: info.filename,
          mimetype: info.mimeType,
        };
      });
    });

    bb.on('field', (name, value) => {
      if (name === 'folder') {
        folder = value;
      }
    });

    bb.on('finish', () => {
      resolve({ file, folder });
    });

    bb.on('error', (err) => {
      reject(err);
    });

    // Write the body to busboy
    bb.write(Buffer.from(event.body || '', event.isBase64Encoded ? 'base64' : 'utf8'));
    bb.end();
  });
}

// Upload to S3
async function uploadToS3(fileBuffer: Buffer, fileName: string, mimeType: string, folder: string = ''): Promise<string> {
  try {
    console.log('🚀 Starting S3 upload...');
    console.log('📁 Bucket:', BUCKET_NAME);
    console.log('📂 Folder:', folder);
    console.log('📄 File:', fileName);

    if (!BUCKET_NAME || !BUCKET_URL) {
      throw new Error('S3 bucket configuration missing');
    }

    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = folder ? `${folder}/${timestamp}_${sanitizedFileName}` : `${timestamp}_${sanitizedFileName}`;

    console.log('🔑 S3 Key:', key);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await s3Client.send(command);

    const fileUrl = `${BUCKET_URL}/${key}`;
    console.log('✅ Upload successful:', fileUrl);
    return fileUrl;
  } catch (err: any) {
    console.error('❌ Error uploading to S3:', err);
    throw new Error(`Failed to upload file to S3: ${err.message}`);
  }
}

// Delete from S3
async function deleteFromS3(fileUrl: string): Promise<void> {
  try {
    console.log('🗑️  Deleting file from S3:', fileUrl);

    if (!BUCKET_NAME || !BUCKET_URL) {
      throw new Error('S3 bucket configuration missing');
    }

    // Extract key from URL
    const key = fileUrl.replace(`${BUCKET_URL}/`, '');
    console.log('🔑 S3 Key to delete:', key);

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log('✅ Delete successful');
  } catch (err: any) {
    console.error('❌ Error deleting from S3:', err);
    throw new Error(`Failed to delete file from S3: ${err.message}`);
  }
}

export const handler: Handler = async (event: HandlerEvent) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCors();
  }

  const user = await validateAuth(event);
  if (!user) {
    return unauthorized();
  }

  try {
    // POST - Upload file
    if (event.httpMethod === 'POST') {
      console.log('📥 Upload request received');
      console.log('👤 User:', user);

      const { file, folder } = await parseMultipartForm(event);

      if (!file) {
        console.log('❌ No file in request');
        return badRequest('No file uploaded');
      }

      console.log('📂 Folder:', folder);

      const fileUrl = await uploadToS3(file.buffer, file.filename, file.mimetype, folder || 'uploads');

      console.log('✅ Upload complete, sending response');
      return success({ url: fileUrl });
    }

    // DELETE - Delete file
    if (event.httpMethod === 'DELETE') {
      const body = JSON.parse(event.body || '{}');
      const { url } = body;

      if (!url) {
        return badRequest('File URL is required');
      }

      console.log('📥 Delete request received');
      console.log('👤 User:', user);
      console.log('🗑️  File URL:', url);

      await deleteFromS3(url);

      console.log('✅ Delete complete');
      return success({ message: 'File deleted successfully' });
    }

    return error('Method not allowed', 405);
  } catch (err: any) {
    console.error('❌ Upload error:', err);
    return error('Failed to process file', 500, err.message);
  }
};

