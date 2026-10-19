import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/** Production databases created before the enquiry pipeline lack this column. */
export class LeadStatus2026101900000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('lead') && !(await queryRunner.hasColumn('lead', 'status'))) {
      await queryRunner.addColumn('lead', new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['new', 'contacted', 'qualified', 'closed'],
        default: "'new'",
      }));
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('lead') && await queryRunner.hasColumn('lead', 'status')) {
      await queryRunner.dropColumn('lead', 'status');
    }
  }
}
