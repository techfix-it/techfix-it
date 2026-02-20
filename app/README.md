# TechFix It - IT Support & Tech Solutions

A modern, high-performance website for an IT support company in Ireland, built with **Next.js 14**, **TypeScript**, and **Supabase**.

![TechFix It Hero](public/hero-placeholder.jpg)

## 🚀 Features

*   **Modern UI/UX**: Responsive design with a premium feel using CSS Modules and Lucide Icons.
*   **Dynamic Content**: All sections (Services, Pricing, Testimonials, Hero) are manageable via an Admin Panel.
*   **Supabase Backend**: Data persistence for all site content and admin authentication.
*   **Admin Panel**: specific route `/admin` to secure content management.
*   **SEO Optimized**: Server-Side Rendering (SSR) and dynamic metadata.
*   **Lottie Animations**: Engaging visual elements.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
*   **Styling**: CSS Modules, PostCSS
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Auth**: [NextAuth.js](https://next-auth.js.org/)
*   **Forms**: React Hook Form

## 📦 Getting Started

### Prerequisites

*   Node.js 18+
*   npm or yarn
*   A Supabase project

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/YOUR_USERNAME/techfix-it.git
    cd techfix-it/app
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up Environment Variables:
    Create a `.env.local` file in the `app` directory:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    NEXTAUTH_SECRET=your_generated_secret
    NEXTAUTH_URL=http://localhost:3000
    ```

4.  Database Setup:
    *   Run the provided `supabase.sql` script in your Supabase SQL Editor to create tables.
    *   Run `seed_admin.sql` to create the initial admin user.

5.  Run the development server:
    ```bash
    npm run dev
    ```

6.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🚀 Deployment on Vercel

1.  Connect your GitHub repository to Vercel.
2.  **IMMEDIATELY** Go to **Settings > Environment Variables**.
3.  Add the same variables from your `.env.local` file:
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `NEXTAUTH_SECRET`
    *   `NEXTAUTH_URL`: Set to your Vercel domain (e.g., `https://techfix-it.vercel.app`)
4.  Redeploy if necessary.

## 🔐 Admin Access

Access the admin panel at `/admin`.
*   **Default Email**: `[EMAIL_ADDRESS]`
*   **Default Password**: `password123` (Change this in production!)

## 📁 Project Structure

*   `/src/app`: App Router pages and API routes.
*   `/src/components`: Reusable UI components.
*   `/src/lib`: Database and Auth utilities.
*   `/src/data`: Legacy JSON data (deprecated).

## 📄 License

This project is licensed under the MIT License.
