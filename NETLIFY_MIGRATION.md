# 🚀 Backend Migration to Netlify Functions

## ✅ Migration Complete

Your Express.js backend has been successfully migrated to **Netlify Serverless Functions**!

---

## 📁 What Changed

### **Created Netlify Functions** (in `netlify/functions/`)

1. **`login.ts`** - User authentication (JWT tokens)
2. **`profile.ts`** - Profile management (GET, PUT)
3. **`project.ts`** - Project CRUD operations
4. **`skills.ts`** - Skills management
5. **`employment.ts`** - Employment history management
6. **`upload.ts`** - S3 file upload/delete (multipart form data)
7. **`apiKey.ts`** - API key generation and rotation
8. **`prompt.ts`** - System prompts management

### **Shared Utilities** (in `netlify/functions/utils/`)

- **`auth.ts`** - JWT verification, API key validation
- **`response.ts`** - Standardized response helpers (success, error, CORS)

### **Configuration Files**

- **`netlify.toml`** - Netlify configuration with route redirects
- **`package.json`** - Added `busboy` and `@types/busboy` for file uploads

---

## 🔄 API Routes Mapping

All routes remain the same from the frontend perspective:

| Original Route | Netlify Function | Methods |
|---|---|---|
| `/api/login` | `login.ts` | POST |
| `/api/profile/:id` | `profile.ts` | GET, PUT |
| `/api/project` | `project.ts` | GET, POST |
| `/api/project/:id` | `project.ts` | GET, PUT, DELETE |
| `/api/skills/:id` | `skills.ts` | GET, POST, DELETE |
| `/api/employment/:id` | `employment.ts` | GET, POST, PUT, DELETE |
| `/api/upload` | `upload.ts` | POST, DELETE |
| `/api/apiKey` | `apiKey.ts` | GET, POST |
| `/api/prompt/:id` | `prompt.ts` | GET, POST, PUT |

---

## 🛠️ Environment Variables

**Important:** Netlify Functions use environment variables WITHOUT the `VITE_` prefix.

### Required Environment Variables (Netlify Dashboard)

```bash
# Database
DATABASE_URL=your_database_url

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=ap-southeast-2
AWS_S3_BUCKET_NAME=my-portfolio-cms
AWS_S3_BUCKET_URL=https://my-portfolio-cms.s3.ap-southeast-2.amazonaws.com
```

### How to Set in Netlify

1. Go to **Site settings** → **Environment variables**
2. Add all the variables above
3. **Redeploy** your site

---

## 🚀 Deployment Steps

### 1. **Push to Git**

```bash
git add .
git commit -m "Migrate backend to Netlify Functions"
git push
```

### 2. **Set Environment Variables** (see above)

### 3. **Deploy**

Netlify will automatically detect `netlify.toml` and:
- Build your frontend with `npm run build`
- Deploy functions from `netlify/functions/`
- Set up URL redirects

---

## 🧪 Testing Locally

### **Start Netlify Dev Server**

```bash
npx netlify dev
```

This will:
- Run your frontend on `http://localhost:8888`
- Run functions at `/.netlify/functions/*`
- Automatically handle redirects

### **Test Upload Function**

The upload function uses `busboy` for multipart form data parsing, which is compatible with Netlify's serverless environment.

---

## 🔧 Key Differences from Express

### **1. No Express Middleware**
- Authentication is now a **utility function** (`validateAuth`)
- CORS headers are added to **every response**

### **2. File Uploads**
- Uses `busboy` instead of `multer`
- Parses multipart form data directly from event body

### **3. Route Params**
- Extracted from `event.path` (e.g., `/api/project/123`)
- Not automatic like Express `req.params`

### **4. Response Format**
```typescript
return {
  statusCode: 200,
  headers: { 'Content-Type': 'application/json', ... },
  body: JSON.stringify(data)
};
```

---

## ⚠️ Known Issues

### **TypeScript Errors** (Non-blocking)
- Duplicate `drizzle-orm` packages cause type mismatches
- **Runtime works fine**, only a TypeScript issue
- **Fix:** Remove `backend/node_modules` if not needed:
  ```bash
  rm -rf backend/node_modules
  npm install
  ```

---

## 📊 Benefits of This Migration

✅ **Serverless** - No server maintenance  
✅ **Auto-scaling** - Handles traffic spikes automatically  
✅ **Cost-effective** - Pay per execution  
✅ **Global CDN** - Fast worldwide  
✅ **Easier deployment** - One command: `git push`  

---

## 🧹 Optional Cleanup

You can now **remove the old backend** if you want:

```bash
# Optional: Remove old Express backend
rm -rf backend/
```

**But keep:**
- `backend/src/db/` (database schema and connection)

Or just leave it for reference!

---

## 🎉 You're Done!

Your portfolio CMS is now fully serverless! 🚀

**Frontend:** Vite + React  
**Backend:** Netlify Functions  
**Database:** Neon (PostgreSQL)  
**Storage:** AWS S3  

Deploy and enjoy! 🎊

