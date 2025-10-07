# Vercel Environment Variables for Bible Project

## Required Environment Variables

Copy and paste these into your Vercel dashboard (Project → Settings → Environment Variables):

### Core Application Settings
```
NODE_ENV = production
FRONTEND_URL = https://bible-project.vercel.app
VITE_API_URL = https://bible-project.vercel.app/api
```

### Database (Neon PostgreSQL)
```
DATABASE_URL = postgresql://username:password@host:port/database
```
**Note:** Replace with your actual Neon database URL from neon.tech

### Authentication
```
JWT_SECRET = bible-project-super-secret-jwt-key-2024
```

### Email Configuration (Gmail SMTP)
```
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = your-email@gmail.com
EMAIL_PASS = your-gmail-app-password
```
**Note:** You'll need to generate an App Password in Gmail settings

### Cloudinary (Image Uploads)
```
CLOUDINARY_CLOUD_NAME = your-cloudinary-cloud-name
CLOUDINARY_API_KEY = your-cloudinary-api-key
CLOUDINARY_API_SECRET = your-cloudinary-api-secret
```
**Note:** Sign up at cloudinary.com for free account

### Stripe (Donations - Optional)
```
STRIPE_PUBLISHABLE_KEY = pk_live_your_stripe_publishable_key
STRIPE_SECRET_KEY = sk_live_your_stripe_secret_key
```
**Note:** Get these from stripe.com dashboard

## How to Get Each Service:

### 1. Neon Database
1. Go to neon.tech
2. Create new project
3. Copy the connection string from Connection Details
4. Replace DATABASE_URL with your actual URL

### 2. Gmail App Password
1. Go to Gmail → Settings → Security
2. Enable 2-Factor Authentication
3. Generate App Password
4. Use that password for EMAIL_PASS

### 3. Cloudinary
1. Go to cloudinary.com
2. Sign up for free account
3. Go to Dashboard
4. Copy Cloud Name, API Key, and API Secret

### 4. Stripe (Optional)
1. Go to stripe.com
2. Create account
3. Go to Developers → API Keys
4. Copy Publishable and Secret keys

## Important Notes:

- Replace all placeholder values with your actual credentials
- Keep these values secure - never commit them to GitHub
- Test each service individually before deploying
- Make sure your Neon database is accessible from Vercel
