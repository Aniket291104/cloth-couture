# Handmade Clothing E-commerce Platform

A production-ready monorepo for a premium handmade clothing storefront and admin suite.

## Stack

- Frontend: React, Vite, Tailwind CSS, shadcn-style UI components, React Router, Axios, Framer Motion, React Hook Form, Zod
- Backend: Node.js, Express, MongoDB Atlas, Mongoose, JWT, Bcrypt, Multer, Cloudinary, Razorpay
- Extras: Recharts analytics, PWA support, SEO meta tags, role-based admin panel

## Structure

```text
client/   Premium storefront + admin dashboard
server/   API, auth, payments, uploads, analytics
```

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy env templates:

   ```bash
   copy client/.env.example client/.env
   copy server/.env.example server/.env
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

## Deployment

- Frontend: Vercel
- Backend: Render or Railway
- Database: MongoDB Atlas
- Images: Cloudinary
- Payments: Razorpay

Detailed setup notes live in the env templates and inline comments in the config files.
