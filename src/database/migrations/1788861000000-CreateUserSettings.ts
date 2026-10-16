import { MigrationInterface, QueryRunner } from 'typeorm';

/** Adds persisted notification and appearance preferences for every user. */
export class CreateUserSettings1788861000000 implements MigrationInterface {
  name = 'CreateUserSettings1788861000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`user_settings\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`userId\` int NOT NULL,
        \`emailNewLeads\` tinyint NOT NULL DEFAULT 1,
        \`pushNewLeads\` tinyint NOT NULL DEFAULT 1,
        \`weeklyDigest\` tinyint NOT NULL DEFAULT 0,
        \`theme\` enum ('light', 'dark', 'system') NOT NULL DEFAULT 'system',
        \`compactMode\` tinyint NOT NULL DEFAULT 0,
        \`reducedMotion\` tinyint NOT NULL DEFAULT 0,
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_user_settings_userId\` (\`userId\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_user_settings_user\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `user_settings`');
  }
}
