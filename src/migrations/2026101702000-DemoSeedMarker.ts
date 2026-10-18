import { MigrationInterface, QueryRunner } from 'typeorm';

export class DemoSeedMarker2026101702000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE IF NOT EXISTS `demo_seed_runs` (`id` tinyint unsigned NOT NULL PRIMARY KEY, `completed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP)');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `demo_seed_runs`');
  }
}
