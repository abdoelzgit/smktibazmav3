-- Google-authenticated users do not have a local password.
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
