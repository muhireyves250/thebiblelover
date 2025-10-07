# Bible Project Backend API

A scalable Node.js backend API for The Bible Lover blog website, built with Express.js and MongoDB.

## 🚀 Features

- **Authentication System**: JWT-based authentication with user registration, login, and profile management
- **Blog Management**: Full CRUD operations for blog posts with categories, tags, and SEO optimization
- **Contact System**: Contact form handling with admin management
- **Donation System**: Donation tracking and management
- **Settings Management**: Dynamic site settings for background, logo, and social media
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Database**: MongoDB with Mongoose ODM
- **Error Handling**: Comprehensive error handling and logging

## 📁 Project Structure

```
api/
├── models/           # MongoDB models
│   ├── User.js
│   ├── BlogPost.js
│   ├── Contact.js
│   └── Donation.js
├── routes/           # API routes
│   ├── auth.js
│   ├── blog.js
│   ├── contact.js
│   ├── donations.js
│   └── settings.js
├── middleware/       # Custom middleware
│   ├── auth.js
│   └── validation.js
├── server.js         # Main server file
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

## 🛠️ Installation

1. **Navigate to the API directory:**
   ```bash
   cd project/api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/bible-project
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB:**
   - Install MongoDB locally or use MongoDB Atlas
   - Ensure MongoDB is running on the configured URI

5. **Run the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /logout` - Logout user

### Blog Posts (`/api/blog`)
- `GET /` - Get all published blog posts (public)
- `GET /:slug` - Get single blog post by slug (public)
- `GET /admin/all` - Get all blog posts (admin)
- `POST /` - Create new blog post (admin)
- `PUT /:id` - Update blog post (admin)
- `DELETE /:id` - Delete blog post (admin)
- `GET /admin/stats` - Get blog statistics (admin)

### Contact (`/api/contact`)
- `POST /` - Submit contact form (public)
- `GET /` - Get all contact messages (admin)
- `GET /:id` - Get single contact message (admin)
- `PUT /:id/status` - Update contact status (admin)
- `DELETE /:id` - Delete contact message (admin)
- `GET /admin/stats` - Get contact statistics (admin)

### Donations (`/api/donations`)
- `POST /` - Submit donation (public)
- `GET /` - Get all donations (admin)
- `GET /:id` - Get single donation (admin)
- `PUT /:id/status` - Update donation status (admin)
- `GET /admin/stats` - Get donation statistics (admin)

### Settings (`/api/settings`)
- `GET /` - Get all settings (public)
- `GET /:category` - Get specific setting category (public)
- `PUT /:category` - Update settings (admin)
- `POST /reset` - Reset settings to default (admin)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Default Admin Credentials
- **Email:** admin@biblelover.com
- **Password:** admin123

## 🗄️ Database Models

### User
- email, password, name, role, isActive, lastLogin, profileImage

### BlogPost
- title, slug, excerpt, content, featuredImage, author, category, tags, status, publishedAt, readTime, views, likes, isFeatured, seoTitle, seoDescription

### Contact
- name, email, subject, message, status, isRead, repliedAt, replyMessage, ipAddress, userAgent

### Donation
- donorName, email, amount, currency, paymentMethod, paymentId, status, message, isAnonymous, receiptSent, receiptEmail

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Express-validator for request validation
- **Password Hashing**: bcryptjs for secure password storage
- **JWT**: Secure token-based authentication

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bible-project
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://yourdomain.com
```

### Build and Start
```bash
npm start
```

## 📝 API Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {
    // Response data
  },
  "errors": [] // Only present on validation errors
}
```

## 🧪 Testing

```bash
npm test
```

## 📞 Support

For questions or issues, please contact the development team.

---

**Built with ❤️ for The Bible Lover community**

