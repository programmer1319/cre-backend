import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class PropertyCommercialDetails2026102000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('property', 'floor'))) {
      await queryRunner.addColumn('property', new TableColumn({ name: 'floor', type: 'varchar', length: '60', isNullable: true }));
    }
    if (!(await queryRunner.hasColumn('property', 'workstations'))) {
      await queryRunner.addColumn('property', new TableColumn({ name: 'workstations', type: 'int', default: 0 }));
    }
    if (!(await queryRunner.hasColumn('property', 'parkingSpaces'))) {
      await queryRunner.addColumn('property', new TableColumn({ name: 'parkingSpaces', type: 'int', default: 0 }));
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const column of ['parkingSpaces', 'workstations', 'floor']) {
      if (await queryRunner.hasColumn('property', column)) await queryRunner.dropColumn('property', column);
    }
  }
}
