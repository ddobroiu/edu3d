-- edu3d.ro -- initializarea tabelelor in baza comuna `toateproiectele`.
--
-- Ruleaza cu: npm run db:init
--
-- Toate instructiunile sunt IF NOT EXISTS, deci scriptul este idempotent si
-- NU poate atinge tabelele kidmy / 3dview (User, Generation, sale50_*, etc.).
-- Numele coloanelor sunt in camelCase, intre ghilimele, ca sa se potriveasca
-- exact cu ce genereaza Prisma din prisma/schema.prisma.

-- ---------------------------------------------------------------------------
-- Conturi
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "edu3d_users" (
    "id"               TEXT PRIMARY KEY,
    "name"             TEXT,
    "email"            TEXT,
    "emailVerified"    TIMESTAMP(3),
    "image"            TEXT,
    "passwordHash"     TEXT,
    "role"             TEXT NOT NULL DEFAULT 'PARENT',
    "credits"          INTEGER NOT NULL DEFAULT 30,
    "totalCreditsUsed" INTEGER NOT NULL DEFAULT 0,
    "schoolName"       TEXT,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "edu3d_users_email_key" ON "edu3d_users" ("email");
CREATE INDEX IF NOT EXISTS "edu3d_users_role_idx" ON "edu3d_users" ("role");

CREATE TABLE IF NOT EXISTS "edu3d_accounts" (
    "id"                TEXT PRIMARY KEY,
    "userId"            TEXT NOT NULL REFERENCES "edu3d_users" ("id") ON DELETE CASCADE,
    "type"              TEXT NOT NULL,
    "provider"          TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token"     TEXT,
    "access_token"      TEXT,
    "expires_at"        INTEGER,
    "token_type"        TEXT,
    "scope"             TEXT,
    "id_token"          TEXT,
    "session_state"     TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS "edu3d_accounts_provider_providerAccountId_key"
    ON "edu3d_accounts" ("provider", "providerAccountId");

CREATE TABLE IF NOT EXISTS "edu3d_sessions" (
    "id"           TEXT PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId"       TEXT NOT NULL REFERENCES "edu3d_users" ("id") ON DELETE CASCADE,
    "expires"      TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "edu3d_sessions_sessionToken_key" ON "edu3d_sessions" ("sessionToken");

CREATE TABLE IF NOT EXISTS "edu3d_verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token"      TEXT NOT NULL,
    "expires"    TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "edu3d_verification_tokens_token_key"
    ON "edu3d_verification_tokens" ("token");
CREATE UNIQUE INDEX IF NOT EXISTS "edu3d_verification_tokens_identifier_token_key"
    ON "edu3d_verification_tokens" ("identifier", "token");

CREATE TABLE IF NOT EXISTS "edu3d_password_reset_tokens" (
    "id"         TEXT PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "token"      TEXT NOT NULL,
    "expires"    TIMESTAMP(3) NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "edu3d_password_reset_tokens_token_key"
    ON "edu3d_password_reset_tokens" ("token");
CREATE INDEX IF NOT EXISTS "edu3d_password_reset_tokens_identifier_idx"
    ON "edu3d_password_reset_tokens" ("identifier");

-- ---------------------------------------------------------------------------
-- Copii si clase
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "edu3d_child_profiles" (
    "id"        TEXT PRIMARY KEY,
    "ownerId"   TEXT NOT NULL REFERENCES "edu3d_users" ("id") ON DELETE CASCADE,
    "name"      TEXT NOT NULL,
    "avatar"    TEXT NOT NULL DEFAULT 'albastru',
    "birthYear" INTEGER,
    "pinHash"   TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "edu3d_child_profiles_ownerId_idx" ON "edu3d_child_profiles" ("ownerId");

CREATE TABLE IF NOT EXISTS "edu3d_classrooms" (
    "id"         TEXT PRIMARY KEY,
    "teacherId"  TEXT NOT NULL REFERENCES "edu3d_users" ("id") ON DELETE CASCADE,
    "name"       TEXT NOT NULL,
    "grade"      TEXT,
    "joinCode"   TEXT NOT NULL,
    "creditPool" INTEGER NOT NULL DEFAULT 0,
    "active"     BOOLEAN NOT NULL DEFAULT true,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "edu3d_classrooms_joinCode_key" ON "edu3d_classrooms" ("joinCode");
CREATE INDEX IF NOT EXISTS "edu3d_classrooms_teacherId_idx" ON "edu3d_classrooms" ("teacherId");

CREATE TABLE IF NOT EXISTS "edu3d_classroom_members" (
    "id"          TEXT PRIMARY KEY,
    "classroomId" TEXT NOT NULL REFERENCES "edu3d_classrooms" ("id") ON DELETE CASCADE,
    "childId"     TEXT NOT NULL REFERENCES "edu3d_child_profiles" ("id") ON DELETE CASCADE,
    "joinedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "edu3d_classroom_members_classroomId_childId_key"
    ON "edu3d_classroom_members" ("classroomId", "childId");
CREATE INDEX IF NOT EXISTS "edu3d_classroom_members_childId_idx" ON "edu3d_classroom_members" ("childId");

-- ---------------------------------------------------------------------------
-- Generari 3D
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "edu3d_generations" (
    "id"             TEXT PRIMARY KEY,
    "userId"         TEXT NOT NULL REFERENCES "edu3d_users" ("id") ON DELETE CASCADE,
    "childId"        TEXT REFERENCES "edu3d_child_profiles" ("id") ON DELETE SET NULL,
    "classroomId"    TEXT REFERENCES "edu3d_classrooms" ("id") ON DELETE SET NULL,
    "mode"           TEXT NOT NULL DEFAULT 'TEXT',
    "prompt"         TEXT,
    "promptEn"       TEXT,
    "sourceImageUrl" TEXT,
    "modelUrl"       TEXT,
    "thumbnailUrl"   TEXT,
    "status"         TEXT NOT NULL DEFAULT 'PENDING',
    "stage"          TEXT NOT NULL DEFAULT 'MODEL',
    "predictionId"   TEXT,
    "creditsCost"    INTEGER NOT NULL DEFAULT 10,
    "refunded"       BOOLEAN NOT NULL DEFAULT false,
    "isPublic"       BOOLEAN NOT NULL DEFAULT false,
    "subject"        TEXT,
    "views"          INTEGER NOT NULL DEFAULT 0,
    "errorMessage"   TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt"    TIMESTAMP(3)
);
CREATE INDEX IF NOT EXISTS "edu3d_generations_userId_idx" ON "edu3d_generations" ("userId");
CREATE INDEX IF NOT EXISTS "edu3d_generations_childId_idx" ON "edu3d_generations" ("childId");
CREATE INDEX IF NOT EXISTS "edu3d_generations_classroomId_idx" ON "edu3d_generations" ("classroomId");
CREATE INDEX IF NOT EXISTS "edu3d_generations_status_idx" ON "edu3d_generations" ("status");
CREATE INDEX IF NOT EXISTS "edu3d_generations_isPublic_createdAt_idx"
    ON "edu3d_generations" ("isPublic", "createdAt");

-- ---------------------------------------------------------------------------
-- Lectii
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "edu3d_lessons" (
    "id"          TEXT PRIMARY KEY,
    "slug"        TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "subject"     TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ageMin"      INTEGER NOT NULL DEFAULT 6,
    "ageMax"      INTEGER NOT NULL DEFAULT 14,
    "coverUrl"    TEXT,
    "modelUrl"    TEXT NOT NULL,
    "hotspots"    JSONB,
    "quiz"        JSONB,
    "vrEnabled"   BOOLEAN NOT NULL DEFAULT true,
    "published"   BOOLEAN NOT NULL DEFAULT false,
    "sortOrder"   INTEGER NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "edu3d_lessons_slug_key" ON "edu3d_lessons" ("slug");
CREATE INDEX IF NOT EXISTS "edu3d_lessons_subject_idx" ON "edu3d_lessons" ("subject");
CREATE INDEX IF NOT EXISTS "edu3d_lessons_published_sortOrder_idx"
    ON "edu3d_lessons" ("published", "sortOrder");

CREATE TABLE IF NOT EXISTS "edu3d_lesson_progress" (
    "id"          TEXT PRIMARY KEY,
    "lessonId"    TEXT NOT NULL REFERENCES "edu3d_lessons" ("id") ON DELETE CASCADE,
    "childId"     TEXT NOT NULL REFERENCES "edu3d_child_profiles" ("id") ON DELETE CASCADE,
    "score"       INTEGER,
    "completedAt" TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "edu3d_lesson_progress_lessonId_childId_key"
    ON "edu3d_lesson_progress" ("lessonId", "childId");
CREATE INDEX IF NOT EXISTS "edu3d_lesson_progress_childId_idx" ON "edu3d_lesson_progress" ("childId");

-- ---------------------------------------------------------------------------
-- Credite si plati
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "edu3d_credit_transactions" (
    "id"          TEXT PRIMARY KEY,
    "userId"      TEXT NOT NULL REFERENCES "edu3d_users" ("id") ON DELETE CASCADE,
    "amount"      INTEGER NOT NULL,
    "type"        TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "purchaseId"  TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "edu3d_credit_transactions_userId_idx" ON "edu3d_credit_transactions" ("userId");
CREATE INDEX IF NOT EXISTS "edu3d_credit_transactions_type_idx" ON "edu3d_credit_transactions" ("type");

CREATE TABLE IF NOT EXISTS "edu3d_purchases" (
    "id"              TEXT PRIMARY KEY,
    "userId"          TEXT NOT NULL REFERENCES "edu3d_users" ("id") ON DELETE CASCADE,
    "stripeSessionId" TEXT,
    "packageId"       TEXT,
    "amount"          DOUBLE PRECISION NOT NULL,
    "credits"         INTEGER NOT NULL,
    "currency"        TEXT NOT NULL DEFAULT 'RON',
    "status"          TEXT NOT NULL DEFAULT 'PENDING',
    "invoiceUrl"      TEXT,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt"     TIMESTAMP(3)
);
CREATE UNIQUE INDEX IF NOT EXISTS "edu3d_purchases_stripeSessionId_key"
    ON "edu3d_purchases" ("stripeSessionId");
CREATE INDEX IF NOT EXISTS "edu3d_purchases_userId_idx" ON "edu3d_purchases" ("userId");
CREATE INDEX IF NOT EXISTS "edu3d_purchases_status_idx" ON "edu3d_purchases" ("status");

CREATE TABLE IF NOT EXISTS "edu3d_billing_details" (
    "id"          TEXT PRIMARY KEY,
    "userId"      TEXT NOT NULL REFERENCES "edu3d_users" ("id") ON DELETE CASCADE,
    "type"        TEXT NOT NULL DEFAULT 'personal',
    "firstName"   TEXT,
    "lastName"    TEXT,
    "companyName" TEXT,
    "cui"         TEXT,
    "regCom"      TEXT,
    "address"     TEXT NOT NULL,
    "city"        TEXT NOT NULL,
    "county"      TEXT,
    "country"     TEXT NOT NULL DEFAULT 'RO',
    "zip"         TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "edu3d_billing_details_userId_key" ON "edu3d_billing_details" ("userId");

-- ---------------------------------------------------------------------------
-- Ajustari pentru bazele initializate inainte de o schimbare de schema.
-- Fiecare instructiune de aici trebuie sa fie sigura la rulari repetate.
-- ---------------------------------------------------------------------------

-- Avatarele ilustrate au fost inlocuite cu initiale pe fundal colorat.
ALTER TABLE "edu3d_child_profiles" ALTER COLUMN "avatar" SET DEFAULT 'albastru';
UPDATE "edu3d_child_profiles" SET "avatar" = 'albastru' WHERE "avatar" = 'fox';

-- ---------------------------------------------------------------------------
-- Biblioteca externa adusa in platforma
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "edu3d_library_models" (
    "uid"          TEXT PRIMARY KEY,
    "name"         TEXT NOT NULL,
    "author"       TEXT,
    "authorUrl"    TEXT,
    "license"      TEXT,
    "licenseSlug"  TEXT,
    "thumbnailUrl" TEXT,
    "modelUrl"     TEXT,
    "iosUrl"       TEXT,
    "fileSize"     INTEGER,
    "status"       TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "views"        INTEGER NOT NULL DEFAULT 0,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cachedAt"     TIMESTAMP(3)
);
CREATE INDEX IF NOT EXISTS "edu3d_library_models_status_idx" ON "edu3d_library_models" ("status");

-- Evacuarea modelelor din biblioteca se face dupa ultima accesare.
ALTER TABLE "edu3d_library_models" ADD COLUMN IF NOT EXISTS "lastViewedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "edu3d_library_models_lastViewedAt_idx"
    ON "edu3d_library_models" ("lastViewedAt");

-- Limiteaza reincercarile de procesare dupa ce predictia a reusit.
ALTER TABLE "edu3d_generations" ADD COLUMN IF NOT EXISTS "processAttempts" INTEGER NOT NULL DEFAULT 0;

-- Deschiderile platite din biblioteca, per utilizator si model.
CREATE TABLE IF NOT EXISTS "edu3d_library_unlocks" (
    "id"          TEXT PRIMARY KEY,
    "userId"      TEXT NOT NULL REFERENCES "edu3d_users" ("id") ON DELETE CASCADE,
    "uid"         TEXT NOT NULL,
    "creditsPaid" INTEGER NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "edu3d_library_unlocks_userId_uid_key"
    ON "edu3d_library_unlocks" ("userId", "uid");
CREATE INDEX IF NOT EXISTS "edu3d_library_unlocks_userId_idx" ON "edu3d_library_unlocks" ("userId");

-- Datele facturii emise prin Oblio.
ALTER TABLE "edu3d_purchases" ADD COLUMN IF NOT EXISTS "invoiceSeries" TEXT;
ALTER TABLE "edu3d_purchases" ADD COLUMN IF NOT EXISTS "invoiceNumber" TEXT;
ALTER TABLE "edu3d_purchases" ADD COLUMN IF NOT EXISTS "invoiceError" TEXT;
