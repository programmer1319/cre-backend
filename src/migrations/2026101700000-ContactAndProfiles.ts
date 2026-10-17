import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ContactAndProfiles2026101700000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('contact_messages'))) {
      await queryRunner.query(`
        CREATE TABLE contact_messages (
          id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
          name varchar(120) NOT NULL,
          email varchar(190) NOT NULL,
          company varchar(160) NULL,
          message text NOT NULL,
          status enum('new', 'replied', 'archived') NOT NULL DEFAULT 'new',
          createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ) ENGINE=InnoDB
      `);
    }

    if (await queryRunner.hasTable('user')) {
      for (const column of [
        new TableColumn({ name: 'job_title', type: 'varchar', length: '120', isNullable: true }),
        new TableColumn({ name: 'phone', type: 'varchar', length: '40', isNullable: true }),
        new TableColumn({ name: 'bio', type: 'varchar', length: '1200', isNullable: true }),
      ]) {
        if (!(await queryRunner.hasColumn('user', column.name))) {
          await queryRunner.addColumn('user', column);
        }
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('user')) {
      for (const name of ['bio', 'phone', 'job_title']) {
        if (await queryRunner.hasColumn('user', name)) {
          await queryRunner.dropColumn('user', name);
        }
      }
    }
    if (await queryRunner.hasTable('contact_messages')) {
      await queryRunner.dropTable('contact_messages');
    }
  }
}
