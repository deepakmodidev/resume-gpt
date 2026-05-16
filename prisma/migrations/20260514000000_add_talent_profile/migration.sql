-- Enable pgvector before creating the table that uses it
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "TalentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "textHash" TEXT NOT NULL,
    "embedding" vector(384),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TalentProfile_userId_idx" ON "TalentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TalentProfile_userId_textHash_key" ON "TalentProfile"("userId", "textHash");

-- AddForeignKey
ALTER TABLE "TalentProfile" ADD CONSTRAINT "TalentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- HNSW index for cosine similarity search
CREATE INDEX "talent_embedding_hnsw"
    ON "TalentProfile"
    USING hnsw (embedding vector_cosine_ops);
