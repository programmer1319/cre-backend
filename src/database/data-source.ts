import 'dotenv/config';
import { DataSource } from 'typeorm';

/** Standalone TypeORM connection used only by the migration CLI. */
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASS ?? 'admin',
  database: process.env.DB_NAME ?? 'real_estate',
  migrationsTableName: 'typeorm_migrations',
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
