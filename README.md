# Goseikan Kendo Tournament Bracket System

A modern tournament management system for Kendo competitions, built with React, TypeScript, and deployed on Vercel with Neon PostgreSQL database.

## Features

- **Tournament Management**: Create and manage tournaments with multiple formats
- **Team & Participant Registration**: Handle dojo registrations and team formations
- **Bracket Generation**: Double elimination tournament brackets
- **Match Scoring**: Detailed kendo match scoring with timing and actions
- **Court Management**: Multi-court tournament coordination
- **Admin Dashboard**: Complete tournament administration interface
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Vercel serverless functions
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Deployment**: Vercel
- **Authentication**: Custom JWT-based authentication

## Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd goseikan-bracket
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your Neon database URL to .env
   ```

4. **Run database migrations**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

## Database Scripts

- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run database migrations  
- `npm run db:seed` - Seed database with sample data
- `npm run db:push` - Push schema changes to database

## Environment Modes

The application automatically detects the environment:

- **Development**: Uses localStorage when no DATABASE_URL is configured
- **Production**: Uses Neon PostgreSQL when DATABASE_URL is present

This allows for seamless development without requiring a database setup locally.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
