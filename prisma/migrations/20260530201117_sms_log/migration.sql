-- CreateTable
CREATE TABLE "sms_log" (
    "id" SERIAL NOT NULL,
    "recipient" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sensor" INTEGER,
    "distance" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "sid" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sms_log_createdAt_idx" ON "sms_log"("createdAt");
