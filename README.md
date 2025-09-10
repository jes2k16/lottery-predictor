# 🎯 Philippine Lottery Predictor

A modern web application built with NextJS and PostgreSQL that analyzes 25+ years of Philippine lottery data to generate intelligent predictions.

## 🚀 Features

- **Historical Data Analysis**: Store and analyze 25+ years of lottery results
- **Multiple Game Support**: 6/42, 6/45, 6/49, 6/55, 6/58 lottery games
- **Prediction Algorithms**: Multiple statistical approaches for number prediction
- **Performance Tracking**: Compare predictions vs actual results
- **Real-time Updates**: Weekly automated data collection
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS

## 🛠 Tech Stack

- **Frontend**: NextJS 13+, TypeScript, Tailwind CSS
- **Backend**: NextJS API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

## 🏗 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lottery-predictor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/lottery_predictor"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗃 Database Schema

The application uses the following main entities:

- **LotteryGame**: Game configurations (6/42, 6/45, etc.)
- **LotteryResult**: Historical and current draw results
- **Prediction**: Generated predictions with confidence scores
- **NumberStatistics**: Cached statistical data for performance

## 📊 Usage

1. **Data Import**: Import historical lottery data
2. **View Results**: Browse historical lottery results
3. **Generate Predictions**: Create predictions using various algorithms
4. **Track Performance**: Monitor prediction accuracy
5. **Analysis**: View statistical insights and patterns

## 🔮 Prediction Algorithms

- **Frequency Analysis**: Based on number occurrence patterns
- **Hot/Cold Numbers**: Recent frequency vs long-term patterns
- **Pattern Recognition**: Sequence and distribution analysis
- **Machine Learning**: Advanced statistical models (planned)

## 🚧 Development Status

**Phase 1: ✅ Complete**
- Project setup with NextJS, TypeScript, Tailwind CSS
- PostgreSQL database configuration with Prisma
- Basic UI structure and constants

**Phase 2: 🔄 In Progress**
- Database schema and data import system
- Historical data collection and storage

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## ⚖️ Legal Disclaimer

This application is for educational and entertainment purposes only. Lottery games are games of chance, and past results do not guarantee future outcomes. Please gamble responsibly.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.