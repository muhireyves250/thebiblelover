# The Bible Lover - Modern Spiritual Engagement Platform

A sophisticated, full-stack web application designed for spiritual reflection, Bible study, and community engagement. Built with a premium aesthetic and modern performance optimizations.

## 🌟 Key Features

- **Elegant Design**: Curated typography (Serif headers + readable body) and a premium HSL-tailored color palette with full **Dark Mode** support.
- **Community Engagement**: Integrated **Forum**, **Prayer Wall**, and **Daily Devotionals** with member-only interactions.
- **Personalization**: User dashboard for tracking liked reflections, saved Bible verses, and personalized search history.
- **Admin Control**: Robust Admin Dashboard for managing posts, approve/moderating comments, tracking donations, and replying to messages.
- **Bible Tools**: Deep search functionality, "Verse of the Day" sharing, and high-quality spiritual content delivery.

## 🚀 Technology Stack

### Frontend
- **Framework**: React 18 with Vite & **TypeScript**
- **Styling**: Tailwind CSS (Custom Design System)
- **API Client**: Type-safe synchronization with Express backend using custom hooks.
- **Icons**: Lucide React

### Backend
- **Server**: Node.js & Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) with Auth Middleware

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Backend Setup
1. `cd api`
2. `npm install`
3. Configure `.env` (DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY, etc.)
4. `npx prisma migrate dev`
5. `npm start`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Configure `.env` (VITE_API_URL)
4. `npm run dev`

## 📈 Roadmap Completion

- [x] **Phase 1-3**: Architecture & Planning
- [x] **Phase 4-5**: UI Upgrade & Stability
- [x] **Phase 6**: Scalability & Cloud Media
- [x] **Phase 7**: Growth & Membership
- [x] **Phase 8**: Personalization & UX
- [x] **Phase 9**: Performance & Handover

## 📄 License
MIT License - Created for "The Bible Lover" spiritual community.
