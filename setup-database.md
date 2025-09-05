# Database Setup for SLIZ LMS

## Quick Setup with Neon (Free PostgreSQL Cloud Database)

1. **Create a Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up for a free account
   - Create a new project

2. **Get Your Connection String**
   - After creating the project, you'll see a connection string like:
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb
   ```

3. **Update the .env file**
   - Replace the DATABASE_URL in `.env` with your actual connection string

4. **Run the setup**
   ```bash
   npm run db:push
   npm run dev
   ```

## Alternative: Local PostgreSQL with Docker

If you prefer a local setup:

```bash
# Install Docker if not already installed
# Then run PostgreSQL in Docker:
docker run --name sliz-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=sliz_lms -p 5432:5432 -d postgres:15

# Update .env with:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/sliz_lms
```

## Alternative: Supabase (Another Free Option)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get the connection string from Project Settings > Database
4. Update the DATABASE_URL in .env
