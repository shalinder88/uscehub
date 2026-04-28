-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('APPLICANT', 'POSTER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('OBSERVERSHIP', 'EXTERNSHIP', 'RESEARCH', 'POSTDOC', 'ELECTIVE', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN', 'PAUSED');

-- CreateEnum
CREATE TYPE "ListingFormat" AS ENUM ('IN_PERSON', 'HYBRID', 'REMOTE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "FlagStatus" AS ENUM ('OPEN', 'REVIEWED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "JourneyPhase" AS ENUM ('MEDICAL_GRADUATE', 'RESIDENT', 'ATTENDING');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('OFFICIAL', 'COMMUNITY', 'SELF_REPORTED');

-- CreateEnum
CREATE TYPE "WaiverType" AS ENUM ('J1_WAIVER', 'H1B_CAP_EXEMPT', 'H1B_CAP_SUBJECT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'APPLICANT',
    "journeyPhase" "JourneyPhase",
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicant_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "country" TEXT,
    "currentLocation" TEXT,
    "medicalSchool" TEXT,
    "graduationYear" TEXT,
    "currentRole" TEXT,
    "specialtyInterest" TEXT,
    "visaStatus" TEXT,
    "usmleStep1" TEXT,
    "usmleStep2" TEXT,
    "ecfmgStatus" TEXT,
    "shortBio" TEXT,
    "cvUrl" TEXT,
    "cvText" TEXT,
    "linkedin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applicant_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poster_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "npiNumber" TEXT,
    "institutionalEmail" TEXT,
    "title" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "poster_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "description" TEXT,
    "institutionalEmail" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "badges" TEXT NOT NULL DEFAULT '',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "posterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "listingType" "ListingType" NOT NULL,
    "specialty" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "format" "ListingFormat" NOT NULL DEFAULT 'IN_PERSON',
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT,
    "duration" TEXT NOT NULL,
    "cost" TEXT NOT NULL,
    "applicationMethod" TEXT NOT NULL DEFAULT 'platform',
    "contactEmail" TEXT,
    "eligibilitySummary" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" TEXT,
    "applicationDeadline" TEXT,
    "certificateOffered" BOOLEAN NOT NULL DEFAULT false,
    "lorPossible" BOOLEAN NOT NULL DEFAULT false,
    "visaSupport" BOOLEAN NOT NULL DEFAULT false,
    "housingSupport" TEXT,
    "websiteUrl" TEXT,
    "linkVerified" BOOLEAN NOT NULL DEFAULT false,
    "numberOfSpots" TEXT,
    "supervisingPhysician" TEXT,
    "graduationYearPref" TEXT,
    "stepRequirements" TEXT,
    "ecfmgRequired" TEXT,
    "logoUrl" TEXT,
    "adminNotes" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "audienceTag" TEXT,
    "usmleTier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_listings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compared_listings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compared_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "message" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "wasReal" BOOLEAN NOT NULL DEFAULT true,
    "worthCost" BOOLEAN NOT NULL DEFAULT true,
    "actualExposure" INTEGER NOT NULL DEFAULT 3,
    "wouldRecommend" BOOLEAN NOT NULL DEFAULT true,
    "comment" TEXT,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flag_reports" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "FlagStatus" NOT NULL DEFAULT 'OPEN',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flag_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "userName" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_action_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_action_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fellowship_programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "visaSponsorship" BOOLEAN NOT NULL DEFAULT false,
    "requiresUSTraining" BOOLEAN NOT NULL DEFAULT false,
    "matchParticipation" BOOLEAN NOT NULL DEFAULT false,
    "applicationDeadline" TEXT,
    "duration" TEXT,
    "positions" INTEGER,
    "description" TEXT,
    "requirements" TEXT,
    "websiteUrl" TEXT,
    "sourceType" "SourceType" NOT NULL DEFAULT 'OFFICIAL',
    "lastVerified" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fellowship_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "phase" "JourneyPhase" NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waiver_states" (
    "id" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL,
    "stateName" TEXT NOT NULL,
    "conradSlots" INTEGER NOT NULL DEFAULT 30,
    "flexSlots" INTEGER NOT NULL DEFAULT 0,
    "totalSlots" INTEGER NOT NULL DEFAULT 30,
    "timeline" TEXT,
    "processingTime" TEXT,
    "priorityAreas" TEXT,
    "contactInfo" TEXT,
    "contactEmail" TEXT,
    "requirements" TEXT,
    "tips" TEXT,
    "websiteUrl" TEXT,
    "lastVerified" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waiver_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waiver_jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "employer" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "stateCode" TEXT,
    "specialty" TEXT NOT NULL,
    "waiverType" "WaiverType" NOT NULL DEFAULT 'J1_WAIVER',
    "salary" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "signOnBonus" TEXT,
    "loanRepayment" TEXT,
    "hpsaScore" INTEGER,
    "muaDesignation" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "requirements" TEXT,
    "contactEmail" TEXT,
    "websiteUrl" TEXT,
    "sourceType" "SourceType" NOT NULL DEFAULT 'OFFICIAL',
    "lastVerified" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waiver_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lawyers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firmName" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "websiteUrl" TEXT,
    "specialties" TEXT NOT NULL,
    "barNumber" TEXT,
    "yearsExperience" INTEGER,
    "languages" TEXT,
    "freeConsultation" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "sourceType" "SourceType" NOT NULL DEFAULT 'SELF_REPORTED',
    "lastVerified" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "ListingStatus" NOT NULL DEFAULT 'APPROVED',
    "contactClicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lawyers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_verifications" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "verifiedBy" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "sourceUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "applicant_profiles_userId_key" ON "applicant_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "poster_profiles_userId_key" ON "poster_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_ownerId_key" ON "organizations"("ownerId");

-- CreateIndex
CREATE INDEX "listings_status_listingType_idx" ON "listings"("status", "listingType");

-- CreateIndex
CREATE INDEX "listings_state_idx" ON "listings"("state");

-- CreateIndex
CREATE INDEX "listings_specialty_idx" ON "listings"("specialty");

-- CreateIndex
CREATE UNIQUE INDEX "saved_listings_userId_listingId_key" ON "saved_listings"("userId", "listingId");

-- CreateIndex
CREATE UNIQUE INDEX "compared_listings_userId_listingId_key" ON "compared_listings"("userId", "listingId");

-- CreateIndex
CREATE UNIQUE INDEX "applications_listingId_applicantId_key" ON "applications"("listingId", "applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_listingId_userId_key" ON "reviews"("listingId", "userId");

-- CreateIndex
CREATE INDEX "admin_messages_status_createdAt_idx" ON "admin_messages"("status", "createdAt");

-- CreateIndex
CREATE INDEX "fellowship_programs_specialty_idx" ON "fellowship_programs"("specialty");

-- CreateIndex
CREATE INDEX "fellowship_programs_state_idx" ON "fellowship_programs"("state");

-- CreateIndex
CREATE INDEX "community_posts_phase_category_idx" ON "community_posts"("phase", "category");

-- CreateIndex
CREATE UNIQUE INDEX "waiver_states_stateCode_key" ON "waiver_states"("stateCode");

-- CreateIndex
CREATE INDEX "waiver_jobs_state_idx" ON "waiver_jobs"("state");

-- CreateIndex
CREATE INDEX "waiver_jobs_specialty_idx" ON "waiver_jobs"("specialty");

-- CreateIndex
CREATE INDEX "lawyers_state_idx" ON "lawyers"("state");

-- CreateIndex
CREATE INDEX "data_verifications_targetType_targetId_idx" ON "data_verifications"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "applicant_profiles" ADD CONSTRAINT "applicant_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poster_profiles" ADD CONSTRAINT "poster_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compared_listings" ADD CONSTRAINT "compared_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compared_listings" ADD CONSTRAINT "compared_listings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_reports" ADD CONSTRAINT "flag_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_action_logs" ADD CONSTRAINT "admin_action_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waiver_jobs" ADD CONSTRAINT "waiver_jobs_stateCode_fkey" FOREIGN KEY ("stateCode") REFERENCES "waiver_states"("stateCode") ON DELETE SET NULL ON UPDATE CASCADE;

