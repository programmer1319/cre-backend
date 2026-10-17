require('reflect-metadata');
const { resolve } = require('node:path');
const { DataSource } = require('typeorm');

const entityGlob = `${resolve(__dirname, '..', 'dist').replace(/\\/g, '/')}/**/*.entity.js`;
const dataSource = new DataSource({
  type: 'mysql',
  database: 'metadata_validation_only',
  entities: [entityGlob],
});

dataSource.buildMetadatas().then(
  () => {
    if (!dataSource.entityMetadatas.some((metadata) => metadata.name === 'ContactMessage')) {
      throw new Error('ContactMessage was not included in entity metadata validation');
    }
    console.log(`MySQL entity metadata valid (${dataSource.entityMetadatas.length} entities)`);
  },
).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
