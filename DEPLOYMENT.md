# Deployment Guide - Vercel with Neon Database

This guide covers deploying the Goseikan Tournament Bracket application to Vercel with Neon PostgreSQL database integration.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Neon Account**: Sign up at [neon.tech](https://neon.tech)
3. **GitHub Repository**: Your code should be in a GitHub repository

## Step 1: Set Up Neon Database

1. Create a new Neon project at [console.neon.tech](https://console.neon.tech)
2. Copy the connection string (it looks like: `postgresql://username:password@host/database`)
3. Save this for Step 3

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your project directory
vercel

# Follow the prompts to link your project
```

## Step 3: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

```
DATABASE_URL=postgresql://username:password@host/database
NODE_ENV=production
```

**Important**: Replace the `DATABASE_URL` with your actual Neon connection string from Step 1.

## Step 4: Set Up Database Schema

After deployment, you need to initialize your database:

### Method 1: Using Vercel Functions (Recommended)

Create an API endpoint to run migrations:

```bash
# Create a one-time setup endpoint
curl -X POST https://your-app.vercel.app/api/setup
```

### Method 2: Local Migration (Alternative)

If you have the DATABASE_URL locally:

```bash
# Set environment variable
export DATABASE_URL="your-neon-connection-string"

# Generate and run migrations
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Step 5: Verify Deployment

1. Visit your Vercel app URL
2. Test user registration/login functionality
3. Check that data persists across page refreshes
4. Verify admin functions work correctly

## Environment Configuration

The app automatically detects the environment:

- **Development** (localStorage): When `NODE_ENV=development` and no `DATABASE_URL`
- **Production** (database): When `DATABASE_URL` is present

## Database Management

### Viewing Data
- Use Neon's SQL Editor in the dashboard
- Connect with any PostgreSQL client using the connection string

### Backup and Restore
- Neon provides automatic backups
- Manual backups can be created via the dashboard

### Scaling
- Neon automatically scales with your usage
- Upgrade plans as needed for higher limits

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Verify TypeScript compilation passes locally

2. **Database Connection Errors**
   - Verify `DATABASE_URL` is correctly set
   - Check Neon database is not paused/suspended

3. **API Route Errors**
   - Check Vercel function logs in the dashboard
   - Verify CORS headers are set correctly

4. **Performance Issues**
   - Monitor database connection usage
   - Consider implementing connection pooling

### Debug Commands

```bash
# Check build locally
npm run build

# Test database connection
npx tsx -e "import { db } from './src/db/connection'; console.log('Connected!')"

# View Vercel logs
vercel logs
```

## Security Notes

- Never commit `DATABASE_URL` to version control
- Use Vercel's environment variables for all secrets
- Implement proper authentication in production
- Consider rate limiting for API endpoints

## Updates and Maintenance

1. **Code Updates**: Push to your main branch - Vercel auto-deploys
2. **Database Updates**: Run migrations through the setup endpoint
3. **Monitoring**: Use Vercel Analytics and Neon monitoring dashboard

## Support

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Neon**: [neon.tech/docs](https://neon.tech/docs)
- **Application Issues**: Check GitHub repository issues