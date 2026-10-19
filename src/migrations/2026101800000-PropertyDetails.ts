import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/** Adds the editorial fields required by the property management workflow. */
export class PropertyDetails2026101800000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    for (const column of [
      new TableColumn({ name: 'transactionType', type: 'varchar', length: '20', default: "'sale'" }),
      new TableColumn({ name: 'status', type: 'varchar', length: '20', default: "'available'" }),
      new TableColumn({ name: 'visibility', type: 'varchar', length: '20', default: "'published'" }),
      new TableColumn({ name: 'priceUnit', type: 'varchar', length: '80', isNullable: true }),
      new TableColumn({ name: 'featured', type: 'boolean', default: false }),
      new TableColumn({ name: 'amenities', type: 'text', isNullable: true }),
      new TableColumn({ name: 'documents', type: 'text', isNullable: true }),
    ]) {
      if (!(await queryRunner.hasColumn('property', column.name))) {
        await queryRunner.addColumn('property', column);
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const name of ['documents', 'amenities', 'featured', 'priceUnit', 'visibility', 'status', 'transactionType']) {
      if (await queryRunner.hasColumn('property', name)) await queryRunner.dropColumn('property', name);
    }
  }
}
