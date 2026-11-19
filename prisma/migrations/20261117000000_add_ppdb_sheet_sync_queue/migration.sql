CREATE TABLE "ppdb_sheet_sync_queue" (
    "pendaftaranId" TEXT NOT NULL,
    "operation" TEXT NOT NULL DEFAULT 'UPSERT',
    "sheetKey" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ppdb_sheet_sync_queue_pkey" PRIMARY KEY ("pendaftaranId")
);

CREATE INDEX "ppdb_sheet_sync_queue_availableAt_lockedAt_idx"
ON "ppdb_sheet_sync_queue"("availableAt", "lockedAt");
