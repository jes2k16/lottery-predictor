-- CreateTable
CREATE TABLE "public"."lottery_games" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxNumber" INTEGER NOT NULL,
    "numberCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lottery_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lottery_results" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "drawDate" TIMESTAMP(3) NOT NULL,
    "numbers" INTEGER[],
    "jackpot" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lottery_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."predictions" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "predictedFor" TIMESTAMP(3) NOT NULL,
    "numbers" INTEGER[],
    "algorithm" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."number_statistics" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 0,
    "lastDrawn" TIMESTAMP(3),
    "coldStreak" INTEGER NOT NULL DEFAULT 0,
    "hotStreak" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "number_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lottery_games_name_key" ON "public"."lottery_games"("name");

-- CreateIndex
CREATE UNIQUE INDEX "lottery_results_gameId_drawDate_key" ON "public"."lottery_results"("gameId", "drawDate");

-- CreateIndex
CREATE UNIQUE INDEX "number_statistics_gameId_number_key" ON "public"."number_statistics"("gameId", "number");

-- AddForeignKey
ALTER TABLE "public"."lottery_results" ADD CONSTRAINT "lottery_results_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."lottery_games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."predictions" ADD CONSTRAINT "predictions_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."lottery_games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
