-- CreateTable
CREATE TABLE "sensor_readings" (
    "id" SERIAL NOT NULL,
    "sensor" INTEGER NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "angle" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'cm',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_readings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sensor_readings_sensor_createdAt_idx" ON "sensor_readings"("sensor", "createdAt");
