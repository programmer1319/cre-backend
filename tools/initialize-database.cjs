// Explicit first-time setup only. Never synchronize an existing production schema.
require('reflect-metadata');
require('dotenv').config({ quiet: true });
const mysql = require('mysql2/promise');
const { DataSource } = require('typeorm');
const { resolve } = require('node:path');

async function main() {
  if (!process.argv.includes('--apply')) throw new Error('Use --apply to initialize an EMPTY database. Build the backend first.');
  const database = process.env.DB_NAME || 'crefolio';
  if (!/^[a-zA-Z0-9_]+$/.test(database)) throw new Error('Invalid database name');
  const connection = {
    host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root', password: process.env.DB_PASS || '',
  };
  const client = await mysql.createConnection({ ...connection, connectTimeout: 10000 });
  try {
    await client.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    const [tables] = await client.execute('SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?', [database]);
    if (tables.length) throw new Error('Database is not empty. No schema or records were changed.');
  } finally { await client.end(); }
  const dist = resolve(__dirname, '..', 'dist').replace(/\\/g, '/');
  const source = new DataSource({
    type: 'mysql', host: connection.host, port: connection.port,
    username: connection.user, password: connection.password, database,
    entities: [`${dist}/**/*.entity.js`], migrations: [`${dist}/migrations/*.js`],
    synchronize: false, migrationsRun: false,
  });
  try {
    await source.initialize();
    if (source.entityMetadatas.length < 12 || !source.entityMetadatas.some(e => e.name === 'User')) {
      throw new Error('Compiled entities missing. Run the backend build first.');
    }
    await source.synchronize();
    const migrations = await source.runMigrations();
    const [admin] = await source.query('SELECT email, role FROM `user` WHERE email = ?', ['muneeb.workstation@gmail.com']);
    if (admin?.role !== 'admin') throw new Error('Administrator verification failed');
    console.log(`Initialized ${database}: ${source.entityMetadatas.length} entity tables, ${migrations.length} migrations applied.`);
    console.log(`Administrator: ${admin.email}. Set a password through password reset.`);
    console.log('No sample content was inserted.');
  } finally { if (source.isInitialized) await source.destroy(); }
}
main().catch(error => { console.error(error.code || error.message); process.exitCode = 1; });
