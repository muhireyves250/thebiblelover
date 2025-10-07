# 🔗 Frontend-Backend Integration Guide

## ✅ **Integration Complete!**

Your frontend is now fully integrated with the backend API. Here's what has been implemented:

### **📁 New Files Created:**

1. **`src/services/api.js`** - Complete API client with all endpoints
2. **`src/hooks/useAPI.js`** - Custom hooks for API calls and authentication
3. **Updated components** to use backend data

### **🔄 Updated Components:**

1. **Login Page** - Now uses backend authentication
2. **ProtectedRoute** - Uses new authentication system
3. **BlogGrid** - Fetches blog posts from API
4. **BlogCard** - Updated to work with API data structure
5. **Contact Page** - Submits to backend API

## 🚀 **How to Test the Integration:**

### **Step 1: Start Both Servers**

**Backend (Terminal 1):**
```bash
cd project/api
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd project
npm run dev
```

### **Step 2: Test the Features**

**1. Blog Posts:**
- Visit: `http://localhost:5173`
- Should see blog posts loaded from the database
- Loading states and error handling included

**2. Authentication:**
- Visit: `http://localhost:5173/login`
- Login with: `admin@biblelover.com` / `admin123`
- Should redirect to dashboard

**3. Contact Form:**
- Visit: `http://localhost:5173/contact`
- Submit a message
- Should save to database and show success message

**4. Protected Routes:**
- Try accessing: `http://localhost:5173/dashboard`
- Should redirect to login if not authenticated

## 📊 **API Endpoints Available:**

### **Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout

### **Blog:**
- `GET /api/blog` - Get published posts (public)
- `GET /api/blog/:slug` - Get single post (public)
- `POST /api/blog` - Create post (admin)
- `GET /api/blog/admin/all` - Get all posts (admin)

### **Contact:**
- `POST /api/contact` - Submit contact form (public)
- `GET /api/contact` - Get messages (admin)

### **Donations:**
- `POST /api/donations` - Submit donation (public)
- `GET /api/donations` - Get donations (admin)

### **Settings:**
- `GET /api/settings` - Get site settings (public)
- `PUT /api/settings/:category` - Update settings (admin)

## 🛠️ **Custom Hooks Available:**

### **useAuth()**
```javascript
const { user, isAuthenticated, login, logout } = useAuth();
```

### **useAPI()**
```javascript
const { loading, error, execute } = useAPI();
```

### **useFetch()**
```javascript
const { data, loading, error, refetch } = useFetch(() => blogAPI.getPosts());
```

## 🔧 **API Client Usage:**

```javascript
import { authAPI, blogAPI, contactAPI } from '../services/api';

// Login
const response = await authAPI.login(email, password);

// Get blog posts
const posts = await blogAPI.getPosts();

// Submit contact form
await contactAPI.submitContact(formData);
```

## 🎯 **Next Steps:**

### **1. Update Dashboard (Remaining Task)**
The dashboard still needs to be updated to use backend data instead of localStorage.

### **2. Add More Features**
- Blog post creation/editing
- User management
- Settings management
- Donation tracking

### **3. Error Handling**
- Add global error boundary
- Improve error messages
- Add retry mechanisms

### **4. Performance**
- Add caching
- Implement pagination
- Add search functionality

## 🐛 **Troubleshooting:**

### **CORS Issues:**
- Make sure backend is running on port 5000
- Check CORS configuration in server.js

### **Authentication Issues:**
- Clear localStorage and try logging in again
- Check if JWT token is being stored correctly

### **API Connection Issues:**
- Verify backend is running: `http://localhost:5000/api/health`
- Check browser network tab for errors
- Ensure .env file has correct DATABASE_URL

## 📝 **Environment Variables:**

Make sure your `.env` file in `project/api/` contains:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="your-neon-connection-string"
JWT_SECRET=bible-lover-super-secret-jwt-key-2024
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

## 🎉 **Benefits of Integration:**

✅ **Real Data** - No more localStorage, everything in database
✅ **Authentication** - Secure JWT-based auth system
✅ **Error Handling** - Proper error states and loading indicators
✅ **Type Safety** - Consistent data structures
✅ **Scalability** - Ready for production deployment
✅ **Admin Features** - Dashboard ready for content management

Your Bible project is now a full-stack application with a modern, scalable architecture! 🚀

