-- CreateTable
CREATE TABLE "motor_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motor_config_pkey" PRIMARY KEY ("id")
);
