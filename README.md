# Mega Odds - Expert Tips & Predictions Platform

**Your premier destination for expert sports tips, VIP predictions, and winning strategies.**

## 🚀 Quick Start

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository
git clone https://github.com/Alikalie/mega-odds-hq.git

# Step 2: Navigate to the project directory
cd mega-odds-hq

# Step 3: Install dependencies using bun or npm
bun install
# or
npm install

# Step 4: Start the development server
bun run dev
# or
npm run dev
```

The app will be available at `http://localhost:5173`

## 📋 Available Scripts

```sh
bun run dev       # Start development server
bun run build     # Build for production
bun run lint      # Run ESLint
bun run test      # Run tests
bun run test:watch # Run tests in watch mode
```

## 🛠️ Technologies

This project is built with:

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn-ui
- **State Management**: React Query
- **Forms**: React Hook Form + Zod
- **Backend**: Supabase (PostgreSQL + Auth)
- **Testing**: Vitest
- **Package Manager**: Bun

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── admin/       # Admin dashboard components
│   ├── cards/       # Card components
│   ├── dialogs/     # Modal/dialog components
│   ├── dashboard/   # User dashboard components
│   ├── layout/      # Layout components
│   └── ui/          # Shadcn/ui components
├── pages/           # Page components
│   ├── admin/       # Admin pages
│   └── user pages   # User-facing pages
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
└── integrations/    # External service integrations
```

## 🔐 Features

- **User Authentication**: Secure login with Supabase
- **Free Tips**: Public sports predictions
- **VIP Membership**: Premium tips and predictions
- **Special Packages**: Exclusive packages and bundles
- **Admin Dashboard**: Comprehensive management system
- **User Profiles**: Personalized user settings
- **Notifications**: Real-time updates and alerts

## 🚢 Deployment

This project can be deployed to any static hosting service:

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **Others**: Build with `npm run build` and deploy the `dist` folder

## 📝 Environment Setup

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📄 License

This project is proprietary. All rights reserved © 2026 Mega Odds.
