-- CreateTable
CREATE TABLE "actuator_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuator_config_pkey" PRIMARY KEY ("id")
);
