# 🧠 Backend Structure Overview

This document provides a consolidated "Map" of the entire backend logic for **The Bible Lover** platform. Instead of one massive file, the system is organized into **17 specialized modules** to ensure stability and security.

## 📂 Core API Modules (`api/routes`)

Below is a single list of every backend component and what it manages:

1.  **`auth.js`** – Handles user login, registration, and security tokens.
2.  **`user.js`** – Manages user profiles, dashboard data, and spiritual growth stats.
3.  **`blog.js`** – Powers the Blog system (Listings, Likes, and Admin management).
4.  **`prayer-requests.js`** – Manages the Prayer Wall and "I'm Praying" support counts.
5.  **`forum.js`** – Handles categories, topics, and threaded community discussions.
6.  **`bible-verses.js`** – Powers the "Verse of the Day" and the shared Verse library.
7.  **`devotionals.js`** – Manages Daily Devotionals and the archival library.
8.  **`events.js`** – Handles community events, dates, and registration.
9.  **`donations.js`** – Securely logs transactions and donation history.
10. **`contact.js`** – Manages contact form submissions and admin replies.
11. **`newsletter.js`** – Handles email subscriptions and preference settings.
12. **`activity.js`** – Tracks platform-wide engagement trends.
13. **`notifications.js`** – Manages real-time alerts for prayers and replies.
14. **`search.js`** – Powers the global search engine across the whole site.
15. **`settings.js`** – Allows admins to edit site-wide text, logos, and links dynamically.
16. **`stats.js`** – Aggregates live platform numbers (Total Users, Topics, Souls Active).
17. **`upload.js`** – Manages image and video file storage (Cloudinary & Local backup).

## 🛡️ Why are they separate?
*   **Safety**: If one module (like the Newsletter) has an issue, the rest of the site stays online.
*   **Security**: Each module has its own permission checks (e.g., only Admins can access `donations.js`).
*   **Speed**: The server only loads what is needed for each specific request.

---
**This modular structure makes "The Bible Lover" a professional-grade application ready for growth.** 🕊️🚀
