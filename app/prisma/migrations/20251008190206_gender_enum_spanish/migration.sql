-- AlterEnum
-- Cambiar valores del enum Gender de inglés a español
ALTER TYPE "Gender" RENAME TO "Gender_old";

CREATE TYPE "Gender" AS ENUM ('MASCULINO', 'FEMENINO', 'OTRO', 'PREFIERO_NO_DECIR');

-- Actualizar datos existentes en client_profiles
ALTER TABLE "client_profiles" ALTER COLUMN "gender" DROP DEFAULT;
ALTER TABLE "client_profiles" ALTER COLUMN "gender" TYPE "Gender" 
  USING (
    CASE "gender"::text
      WHEN 'MALE' THEN 'MASCULINO'::text
      WHEN 'FEMALE' THEN 'FEMENINO'::text
      WHEN 'OTHER' THEN 'OTRO'::text
      WHEN 'PREFER_NOT_TO_SAY' THEN 'PREFIERO_NO_DECIR'::text
      ELSE NULL
    END
  )::"Gender";

DROP TYPE "Gender_old";
