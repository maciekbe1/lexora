# Lexora - Flashcard Learning App

React Native flashcard learning app with spaced repetition algorithm and multi-language support.

## Setup

1. **Clone and install dependencies:**

```bash
git clone <repo-url>
cd lexora
npm install
```

2. **Setup environment variables:**

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. **Start development:**

```bash
npm start
```

## Database Setup

Database is already configured with template decks. If you need to reset or add data, use Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/[your-project]/sql
2. Run SQL queries directly in the editor

### Current Database Contains:

- ✅ 13 template decks across 5 languages
- ✅ ~90 sample flashcards
- ✅ Complete schema with RLS policies
- ✅ User authentication system

## Features

- ✅ OAuth authentication with Google/Apple
- ✅ Language-based template deck organization (English, Spanish, German, French, Italian)
- ✅ Language selector with flag tabs
- ✅ Hide already added decks from selection
- ✅ Confirmation dialog for deck deletion with progress warning
- ✅ User deck collection management
- ✅ Database ready for spaced repetition algorithm
- ✅ Progress tracking preparation

## Development

```bash
npm start        # Start Expo dev server
npm run android  # Run on Android
npm run ios      # Run on iOS
npm run web      # Run on web
npm run lint     # Run ESLint
npm run typecheck # Run TypeScript check
```

## Project Structure

```
lexora/
├── app/                 # Expo Router (file-based routing)
│   ├── (app)/          # Protected app routes
│   └── (auth)/         # Authentication routes
├── src/
│   ├── shared/         # Shared components and utilities
│   │   ├── components/ # Reusable UI components
│   │   ├── constants/  # App constants (languages, etc.)
│   │   ├── services/   # API services (OAuth, Supabase)
│   │   ├── types/      # TypeScript definitions
│   │   ├── utils/      # Utility functions
│   │   └── validation/ # Validation schemas
│   └── store/          # Zustand stores
├── lib/                # External service configurations
└── assets/             # Static assets (icons, images)
```

## Tech Stack

- **Frontend**: React Native + Expo
- **Routing**: Expo Router (file-based)
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (OAuth)
- **Language**: TypeScript
- **Architecture**: Clean Architecture, Composition-first
