# 🚀 Setup Guide - Philippine Lottery Predictor

## 📋 Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
3. **Git** - [Download](https://git-scm.com/)

## 🗃 Database Setup

### Option 1: Local PostgreSQL

1. **Install PostgreSQL** and start the service
2. **Create a database:**
   ```sql
   CREATE DATABASE lottery_predictor;
   CREATE USER lottery_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE lottery_predictor TO lottery_user;
   ```

3. **Create environment file:**
   ```bash
   # Create .env file in project root
   DATABASE_URL="postgresql://lottery_user:your_password@localhost:5432/lottery_predictor?schema=public"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

### Option 2: Docker PostgreSQL

1. **Run PostgreSQL in Docker:**
   ```bash
   docker run --name lottery-postgres \
     -e POSTGRES_DB=lottery_predictor \
     -e POSTGRES_USER=lottery_user \
     -e POSTGRES_PASSWORD=your_password \
     -p 5432:5432 \
     -d postgres:14
   ```

2. **Create .env file** with the same DATABASE_URL as above

### Option 3: Cloud Database (Recommended for Production)

Use services like:
- **Vercel Postgres** (Free tier available)
- **Supabase** (Free tier available)
- **PlanetScale** (Free tier available)
- **AWS RDS** (Paid)

## 🛠 Installation Steps

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd lottery-predictor
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Run database migrations:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Seed initial data:**
   ```bash
   npm run db:seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Data Import

### Import Historical Data

1. **Via API (Recommended):**
   ```bash
   # Import all historical data (mock data for testing)
   curl -X POST http://localhost:3000/api/import \
     -H "Content-Type: application/json" \
     -d '{"type": "all", "startDate": "2020-01-01", "endDate": "2025-12-31"}'
   ```

2. **Via Database Seed:**
   ```bash
   npm run db:seed
   ```

### Import Real PCSO Data

To import real PCSO data, you'll need to:

1. **Implement actual web scraping** in `src/utils/scraper.ts`
2. **Or import from CSV files** using the import API
3. **Or manually add data** through the web interface

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Database commands
npm run db:migrate     # Run migrations
npm run db:generate    # Generate Prisma client
npm run db:studio      # Open Prisma Studio (database GUI)
npm run db:seed        # Seed initial data

# Build for production
npm run build
npm start
```

## 🌐 API Endpoints

- **GET /api/stats** - Database and game statistics
- **GET /api/results** - Lottery results with filtering
- **POST /api/results** - Add new lottery result
- **POST /api/import** - Bulk import data

## 📱 Features Available After Setup

✅ **Phase 1 Complete:**
- Project setup with NextJS, TypeScript, Tailwind CSS
- PostgreSQL database with Prisma ORM
- Basic UI and navigation

✅ **Phase 2 Complete:**
- Database schema for all lottery games
- Data validation and cleaning utilities
- Web scraper framework (mock implementation)
- Bulk import system for historical data
- API endpoints for data management
- Sample data seeding

🔄 **Next Phases:**
- Real-time data collection scheduler
- Statistical analysis engine
- Prediction algorithms
- Performance tracking system

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_ctl status

# Restart PostgreSQL service
sudo service postgresql restart  # Linux
brew services restart postgresql  # macOS
# Use Services app on Windows
```

### Migration Issues
```bash
# Reset database (WARNING: This deletes all data)
npx prisma migrate reset

# Push schema without migration
npx prisma db push
```

### Import Issues
- Check that lottery games are seeded first
- Verify data format matches validation schema
- Check API endpoints with curl or Postman

## 💡 Tips

1. **Use Prisma Studio** (`npm run db:studio`) for database visualization
2. **Check logs** in the terminal for detailed error messages
3. **Start with mock data** before implementing real PCSO scraping
4. **Use the API endpoints** to test data import before building UI

## 📞 Support

- Check the logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure PostgreSQL is running and accessible
- Test API endpoints with curl or Postman first
