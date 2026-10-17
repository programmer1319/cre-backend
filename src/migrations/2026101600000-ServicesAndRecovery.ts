import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex } from 'typeorm';

export class ServicesAndRecovery2026101600000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('site_services'))) {
      await queryRunner.createTable(new Table({ name: 'site_services', columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'slug', type: 'varchar', length: '100' },
        { name: 'title', type: 'varchar', length: '160' },
        { name: 'icon', type: 'varchar', length: '80' },
        { name: 'summary', type: 'varchar', length: '300' },
        { name: 'kicker', type: 'varchar', length: '120' },
        { name: 'body', type: 'text' },
        { name: 'outcomes', type: 'text' },
        { name: 'process', type: 'text' },
        { name: 'faqs', type: 'text' },
        { name: 'image', type: 'varchar', length: '500' },
        { name: 'isActive', type: 'tinyint', default: 1 },
        { name: 'featured', type: 'tinyint', default: 0 },
        { name: 'sortOrder', type: 'int', default: 0 },
      ] }));
      await queryRunner.createIndex('site_services', new TableIndex({ name: 'IDX_site_services_slug', columnNames: ['slug'], isUnique: true }));
    }
    if (!(await queryRunner.hasTable('password_reset_tokens'))) {
      await queryRunner.createTable(new Table({ name: 'password_reset_tokens', columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'userId', type: 'int' },
        { name: 'tokenHash', type: 'varchar', length: '64' },
        { name: 'expiresAt', type: 'datetime' },
        { name: 'usedAt', type: 'datetime', isNullable: true },
        { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
      ] }));
      await queryRunner.createIndex('password_reset_tokens', new TableIndex({ name: 'IDX_password_reset_user', columnNames: ['userId'] }));
      await queryRunner.createIndex('password_reset_tokens', new TableIndex({ name: 'IDX_password_reset_hash', columnNames: ['tokenHash'], isUnique: true }));
    }
    if (await queryRunner.hasTable('user') && !(await queryRunner.hasColumn('user', 'token_version'))) {
      await queryRunner.addColumn('user', new TableColumn({ name: 'token_version', type: 'int', default: 0 }));
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('password_reset_tokens')) await queryRunner.dropTable('password_reset_tokens');
    if (await queryRunner.hasTable('site_services')) await queryRunner.dropTable('site_services');
    if (await queryRunner.hasTable('user') && await queryRunner.hasColumn('user', 'token_version')) await queryRunner.dropColumn('user', 'token_version');
  }
}
