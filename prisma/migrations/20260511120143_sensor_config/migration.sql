-- CreateTable
CREATE TABLE "sensor_config" (
    "sensor" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sensor_config_pkey" PRIMARY KEY ("sensor")
);
