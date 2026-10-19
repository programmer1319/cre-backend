import { randomBytes } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { MigrationInterface, QueryRunner } from 'typeorm';

const ADMIN_EMAIL = 'muneeb.workstation@gmail.com';

/** One-time account consolidation requested for the production demo. */
export class SoleAdministrator2026101701000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('user'))) {
      throw new Error('Cannot create the administrator: user table is missing');
    }

    const matchingUsers = await queryRunner.query(
      'SELECT id FROM `user` WHERE LOWER(email) = ?',
      [ADMIN_EMAIL],
    ) as Array<{ id: number }>;
    if (matchingUsers.length > 1) {
      throw new Error('Cannot consolidate duplicate administrator email addresses');
    }

    if (matchingUsers.length === 0) {
      // The initial password is never disclosed or stored; the owner uses password reset.
      const randomPasswordHash = await bcrypt.hash(randomBytes(48).toString('base64url'), 12);
      await queryRunner.query(
        'INSERT INTO `user` (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['CreFolio Administrator', ADMIN_EMAIL, randomPasswordHash, 'admin'],
      );
    }

    const [administrator] = await queryRunner.query(
      'SELECT id FROM `user` WHERE LOWER(email) = ?',
      [ADMIN_EMAIL],
    ) as Array<{ id: number }>;
    if (!administrator) {
      throw new Error('Administrator creation could not be verified');
    }
    const adminId = administrator.id;
    await queryRunner.query('UPDATE `user` SET role = ? WHERE id = ?', ['admin', adminId]);

    // Listings and their leads survive removal of their former owners.
    if (await queryRunner.hasTable('property')) {
      const propertyTable = await queryRunner.getTable('property');
      if (!propertyTable?.findColumnByName('ownerId')) {
        throw new Error('Cannot preserve listings: property.ownerId is missing');
      }
      await queryRunner.query(
        'UPDATE `property` SET ownerId = ? WHERE ownerId IS NULL OR ownerId <> ?',
        [adminId, adminId],
      );
    }

    if (await queryRunner.hasTable('password_reset_tokens')) {
      await queryRunner.query('DELETE FROM password_reset_tokens WHERE userId <> ?', [adminId]);
    }
    await queryRunner.query('DELETE FROM `user` WHERE id <> ?', [adminId]);
  }

  async down(): Promise<void> {
    throw new Error('Deleted accounts cannot be restored by reversing this migration');
  }
}
