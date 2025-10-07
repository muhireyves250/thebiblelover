# 🚀 Neon PostgreSQL Setup Guide

## Step 1: Create Neon Account
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project

## Step 2: Get Your Connection String
1. In your Neon dashboard, go to your project
2. Click on "Connection Details"
3. Copy the connection string (it looks like this):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

## Step 3: Create .env File
Create a `.env` file in your `project/api` folder with this content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database - Neon PostgreSQL
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# JWT Secret
JWT_SECRET=bible-lover-super-secret-jwt-key-2024
JWT_EXPIRE=7d

# CORS Origin
FRONTEND_URL=http://localhost:5173
```

**Replace the DATABASE_URL with your actual Neon connection string!**

## Step 4: Install Dependencies
```bash
cd project/api
npm install
```

## Step 5: Generate Prisma Client
```bash
npm run db:generate
```

## Step 6: Push Database Schema
```bash
npm run db:push
```

## Step 7: Start the Server
```bash
npm run dev
```

## 🎉 You're Done!
Your backend should now be connected to Neon PostgreSQL!

## 📊 Database Management
- **View your database:** `npm run db:studio`
- **Reset database:** `npm run db:push --force-reset`
- **Create migrations:** `npm run db:migrate`

## 🔧 Troubleshooting
- Make sure your DATABASE_URL is correct
- Ensure your Neon project is active
- Check that you've run `npm run db:push` to create tables
