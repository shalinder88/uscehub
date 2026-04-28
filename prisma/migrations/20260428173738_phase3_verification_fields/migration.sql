-- CreateEnum
CREATE TYPE "LinkVerificationStatus" AS ENUM ('UNKNOWN', 'VERIFIED', 'REVERIFYING', 'NEEDS_MANUAL_REVIEW', 'SOURCE_DEAD', 'PROGRAM_CLOSED', 'NO_OFFICIAL_SOURCE');

-- CreateEnum
CREATE TYPE "FlagKind" AS ENUM ('BROKEN_LINK', 'WRONG_DEADLINE', 'PROGRAM_CLOSED', 'INCORRECT_INFO', 'DUPLICATE', 'SPAM', 'OTHER');

-- AlterEnum
ALTER TYPE "FlagStatus" ADD VALUE 'IN_REVIEW';

-- AlterTable
ALTER TABLE "data_verifications" ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "finalUrl" TEXT,
ADD COLUMN     "httpStatus" INTEGER,
ADD COLUMN     "method" TEXT,
ADD COLUMN     "statusAfter" TEXT,
ADD COLUMN     "statusBefore" TEXT;

-- AlterTable
ALTER TABLE "flag_reports" ADD COLUMN     "kind" "FlagKind" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "resolvedBy" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "applicationUrl" TEXT,
ADD COLUMN     "lastVerificationAttemptAt" TIMESTAMP(3),
ADD COLUMN     "lastVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "linkVerificationStatus" "LinkVerificationStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "verificationFailureReason" TEXT;

-- Conservative backfill (Phase 3.2):
--   * sourceUrl + applicationUrl seeded from existing websiteUrl.
--   * linkVerificationStatus set to VERIFIED only where the prior
--     linkVerified Boolean was true; everything else stays at the
--     column default (UNKNOWN). REVERIFYING is reserved for the
--     PR 3.3 cron and never used as an initial value.
--   * lastVerifiedAt / lastVerificationAttemptAt left NULL — never
--     invented from updatedAt or createdAt.
UPDATE "listings"
SET "sourceUrl" = "websiteUrl"
WHERE "sourceUrl" IS NULL AND "websiteUrl" IS NOT NULL;

UPDATE "listings"
SET "applicationUrl" = "websiteUrl"
WHERE "applicationUrl" IS NULL AND "websiteUrl" IS NOT NULL;

UPDATE "listings"
SET "linkVerificationStatus" = 'VERIFIED'
WHERE "linkVerified" = true;
