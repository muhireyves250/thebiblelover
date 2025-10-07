# Vercel Deployment Guide

## Prerequisites
1. Vercel account (sign up at vercel.com)
2. GitHub repository connected to Vercel
3. PostgreSQL database (recommended: Supabase, Railway, or Neon)

## Step 1: Environment Variables Setup

### Frontend Environment Variables (in Vercel Dashboard)
```
VITE_API_URL=https://your-app.vercel.app/api
VITE_APP_NAME=The Bible Lover
VITE_APP_DESCRIPTION=A beautiful blog about Bible verses and Christian content
```

### Backend Environment Variables (in Vercel Dashboard)
```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=https://your-app.vercel.app
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret
```

## Step 2: Database Setup

### Option A: Supabase (Recommended)
1. Go to supabase.com and create a new project
2. Get your database URL from Settings > Database
3. Run the following commands in your project:

```bash
# Install Prisma CLI globally
npm install -g prisma

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed the database
npm run db:seed
```

### Option B: Railway
1. Go to railway.app and create a new PostgreSQL database
2. Copy the DATABASE_URL from Railway dashboard
3. Follow the same Prisma commands as above

## Step 3: Deploy to Vercel

### Method 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd "C:\Users\muhir\OneDrive\Desktop\New folder\bible project\project"
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name: bible-project (or your preferred name)
# - Directory: ./
# - Override settings? No
```

### Method 2: GitHub Integration
1. Push your code to GitHub
2. Go to vercel.com/dashboard
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Step 4: Configure Build Settings

In Vercel dashboard, go to your project settings:

### Build & Development Settings
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Development Command: `npm run dev`

### Environment Variables
Add all the environment variables listed in Step 1.

## Step 5: Database Migration

After deployment, you need to run database migrations:

```bash
# Connect to your deployed project
vercel env pull .env.local

# Run migrations
npx prisma db push
npx prisma db seed
```

## Step 6: Test Your Deployment

1. Visit your deployed URL
2. Test the following features:
   - Home page loads
   - Blog posts display
   - Authentication works
   - Bible verses functionality
   - Contact form
   - Admin dashboard

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are in package.json
2. **API Routes Not Working**: Ensure vercel.json is configured correctly
3. **Database Connection**: Verify DATABASE_URL is correct
4. **CORS Issues**: Check FRONTEND_URL environment variable

### Useful Commands:
```bash
# View deployment logs
vercel logs

# Check environment variables
vercel env ls

# Redeploy
vercel --prod
```

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Database connection works
- [ ] Authentication functions
- [ ] File uploads work
- [ ] Email sending works
- [ ] All environment variables set
- [ ] Custom domain configured (optional)

## Support

If you encounter issues:
1. Check Vercel function logs in the dashboard
2. Verify all environment variables are set
3. Ensure database is accessible from Vercel
4. Check CORS configuration
