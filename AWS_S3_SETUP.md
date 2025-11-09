# AWS S3 Image Upload - Setup Complete ✅

## What Was Fixed

### 1. **CORS Error** ❌ → ✅
Previously, uploads were failing because:
- Frontend was uploading **directly to S3** from the browser
- S3 bucket didn't have CORS configuration
- AWS credentials were exposed in frontend code (security risk)

### 2. **Better Solution Implemented** 
Now uploads go **through the backend**:
- ✅ **Secure**: AWS credentials stay on server
- ✅ **No CORS issues**: Backend handles S3 communication
- ✅ **Better control**: Can add validation, image processing, etc.
- ✅ **Database saves URL**: Profile/Project endpoints properly save image URLs

---

## New Architecture

```
Frontend → Backend API → AWS S3 → Database
   ↓           ↓            ↓         ↓
 Upload    Process       Store    Save URL
  File      File         File     to DB
```

---

## What Was Created

### Backend Files

1. **`backend/src/utils/s3.ts`**
   - S3 upload/delete functions using server-side credentials
   - Generates unique filenames with timestamps
   - Handles errors gracefully

2. **`backend/src/routes/upload.ts`**
   - `POST /api/upload` - Upload image endpoint
   - `DELETE /api/upload` - Delete image endpoint
   - Uses `multer` for file handling
   - 5MB file size limit
   - Image-only validation

3. **`backend/src/server.ts`** (updated)
   - Registered `/api/upload` route

### Frontend Files

1. **`src/lib/uploadHelper.ts`** (NEW)
   - `uploadFileViaBackend()` - Upload via backend
   - `deleteFileViaBackend()` - Delete via backend

2. **`src/home/manage-profile/ManageProfile.tsx`** (updated)
   - Now uses backend upload instead of direct S3
   - Properly saves image URL to database
   - Handles old image deletion

3. **`src/home/manage-project/ManageProject.tsx`** (updated)
   - Now uses backend upload for project images
   - Add/Edit/Delete all work with S3

---

## Environment Variables

Add these to your **backend `.env`** file:

```bash
AWS_ACCESS_KEY=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_REGION=ap-southeast-2
AWS_S3_BUCKET_NAME=my-portfolio-cms
AWS_S3_BUCKET_URL=https://my-portfolio-cms.s3.ap-southeast-2.amazonaws.com
```

**Note**: Remove `VITE_` prefix from frontend `.env` as AWS credentials are now **only** on backend.

---

## S3 Bucket Configuration

You still need to configure your S3 bucket for public access:

### 1. Bucket Policy (for public read access)

Go to AWS S3 Console → Your Bucket → Permissions → Bucket Policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::my-portfolio-cms/*"
        }
    ]
}
```

### 2. Block Public Access Settings

Go to Permissions → Block public access:
- **Uncheck**: "Block all public access"
- Or specifically uncheck: "Block public access to buckets and objects granted through new public bucket or access point policies"

### 3. ACL Settings (Optional)

If you get ACL errors, go to Permissions → Object Ownership:
- Enable "ACLs enabled"
- Select "Bucket owner preferred"

---

## How to Test

### 1. Restart Backend
```bash
cd backend
npm run dev
```

### 2. Test Profile Image Upload
1. Go to Manage Profile
2. Click "Upload Photo"
3. Select an image
4. Click "Save Changes"
5. Image should upload to S3 and URL saved to database

### 3. Test Project Image Upload
1. Go to Manage Projects
2. Click "Add Project"
3. Upload an image
4. Fill in details
5. Submit - image uploaded to S3

---

## Folder Structure in S3

Images are organized by type:
```
my-portfolio-cms/
├── profile-picture/
│   └── 1762656194585_profile_pic.jpg
└── project/
    └── 1762656194585_project_image.jpg
```

---

## API Endpoints

### Upload Image
```http
POST /api/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- image: File
- folder: string (optional, default: "uploads")

Response:
{
  "url": "https://bucket-url/folder/timestamp_filename.jpg"
}
```

### Delete Image
```http
DELETE /api/upload
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "url": "https://bucket-url/folder/timestamp_filename.jpg"
}

Response:
{
  "success": true
}
```

---

## Security Benefits

✅ **AWS credentials** never exposed to frontend
✅ **File validation** on backend (size, type)
✅ **Authentication** required for uploads
✅ **Rate limiting** can be added easily
✅ **Virus scanning** can be added if needed

---

## Troubleshooting

### "Failed to upload file"
- Check AWS credentials in backend `.env`
- Verify S3 bucket name is correct
- Check AWS region matches your bucket

### "Access Denied" from S3
- Verify IAM user has `s3:PutObject` and `s3:DeleteObject` permissions
- Check bucket policy allows public read access

### Image URL not saved
- Backend already saves it correctly (`profile.ts` line 42-45)
- Check network tab to verify PUT request succeeds

---

## Next Steps (Optional)

1. **Image Optimization**: Add sharp/jimp to resize images before upload
2. **CDN**: Put CloudFront in front of S3 for faster delivery
3. **Image Processing**: Add thumbnail generation
4. **Validation**: Add more file type validation
5. **Compression**: Compress images before upload

---

✨ **Your image uploads are now secure and working!**

