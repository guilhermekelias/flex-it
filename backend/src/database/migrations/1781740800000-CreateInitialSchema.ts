import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1781740800000 implements MigrationInterface {
  name = 'CreateInitialSchema1781740800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('professional', 'student')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."observations_sender_role_enum" AS ENUM('professional', 'student')`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "name" character varying(150) NOT NULL,
        "email" character varying(150) NOT NULL,
        "password" character varying(255) NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'student',
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "student" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "age" integer NOT NULL,
        "goal" character varying NOT NULL,
        "professional_id" integer,
        "user_id" integer,
        CONSTRAINT "PK_3d8016e1cb58429474a3c041904" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "observations" (
        "id" SERIAL NOT NULL,
        "message" text NOT NULL,
        "student_id" integer NOT NULL,
        "professional_id" integer NOT NULL,
        "sender_role" "public"."observations_sender_role_enum" NOT NULL DEFAULT 'professional',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_f9208d64f50a76030758087c0ef" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "workouts" (
        "id" SERIAL NOT NULL,
        "name" character varying(150) NOT NULL,
        "description" text,
        "type" character varying(100) NOT NULL,
        "duration_minutes" integer NOT NULL,
        "exercises_count" integer NOT NULL,
        "exercises" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "student_id" integer NOT NULL,
        "professional_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_5b2319bf64a674d40237dbb1697" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "metrics" (
        "id" SERIAL NOT NULL,
        "weight_kg" double precision,
        "height_cm" double precision,
        "body_fat_percentage" double precision,
        "muscle_mass_kg" double precision,
        "notes" text,
        "recorded_at" TIMESTAMP NOT NULL,
        "student_id" integer NOT NULL,
        "professional_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_5283cad666a83376e28a715bf0e" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "nutrition_plans" (
        "id" SERIAL NOT NULL,
        "name" character varying(150) NOT NULL,
        "objective" character varying(150) NOT NULL,
        "calories" integer NOT NULL,
        "protein_grams" integer NOT NULL,
        "carbs_grams" integer NOT NULL,
        "fat_grams" integer NOT NULL,
        "meals_count" integer NOT NULL,
        "meals" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "notes" text,
        "student_id" integer NOT NULL,
        "professional_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_d4fe9565a376834cdea3b4b771a" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "student"
      ADD CONSTRAINT "FK_c5a328c36e1c879c86c22334400"
      FOREIGN KEY ("professional_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "student"
      ADD CONSTRAINT "FK_0cc43638ebcf41dfab27e62dc09"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "observations"
      ADD CONSTRAINT "FK_dfdbe272b14d9537d921a244a0f"
      FOREIGN KEY ("student_id") REFERENCES "student"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "observations"
      ADD CONSTRAINT "FK_b297d3cd4f21fcb00de1d487f7a"
      FOREIGN KEY ("professional_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "workouts"
      ADD CONSTRAINT "FK_89831f278682031ad72a256cf57"
      FOREIGN KEY ("student_id") REFERENCES "student"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "workouts"
      ADD CONSTRAINT "FK_f223b78d95f4de99b2d933a37a0"
      FOREIGN KEY ("professional_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "metrics"
      ADD CONSTRAINT "FK_0f580e4ea7882fa3f5a8f77b9d1"
      FOREIGN KEY ("student_id") REFERENCES "student"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "metrics"
      ADD CONSTRAINT "FK_668317c62b811b9e69d2df08588"
      FOREIGN KEY ("professional_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "nutrition_plans"
      ADD CONSTRAINT "FK_91750cb59b02539e03a2f350379"
      FOREIGN KEY ("student_id") REFERENCES "student"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "nutrition_plans"
      ADD CONSTRAINT "FK_ed032889f35cc91d85cdd99958f"
      FOREIGN KEY ("professional_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nutrition_plans" DROP CONSTRAINT "FK_ed032889f35cc91d85cdd99958f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nutrition_plans" DROP CONSTRAINT "FK_91750cb59b02539e03a2f350379"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metrics" DROP CONSTRAINT "FK_668317c62b811b9e69d2df08588"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metrics" DROP CONSTRAINT "FK_0f580e4ea7882fa3f5a8f77b9d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workouts" DROP CONSTRAINT "FK_f223b78d95f4de99b2d933a37a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workouts" DROP CONSTRAINT "FK_89831f278682031ad72a256cf57"`,
    );
    await queryRunner.query(
      `ALTER TABLE "observations" DROP CONSTRAINT "FK_b297d3cd4f21fcb00de1d487f7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "observations" DROP CONSTRAINT "FK_dfdbe272b14d9537d921a244a0f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" DROP CONSTRAINT "FK_0cc43638ebcf41dfab27e62dc09"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" DROP CONSTRAINT "FK_c5a328c36e1c879c86c22334400"`,
    );
    await queryRunner.query(`DROP TABLE "nutrition_plans"`);
    await queryRunner.query(`DROP TABLE "metrics"`);
    await queryRunner.query(`DROP TABLE "workouts"`);
    await queryRunner.query(`DROP TABLE "observations"`);
    await queryRunner.query(`DROP TABLE "student"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(
      `DROP TYPE "public"."observations_sender_role_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
