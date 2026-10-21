const { cpSync, copyFileSync, mkdirSync, readdirSync, rmSync } = require('node:fs');
const { join } = require('node:path');

const projectRoot = join(__dirname, '..');
const uploads = join(projectRoot, 'uploads');
const target = join(projectRoot, 'dist', 'demo-assets');

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(join(uploads, 'variants'), join(target, 'variants'), { recursive: true });

for (const filename of readdirSync(uploads)) {
  if (filename.toLowerCase().endsWith('.pdf')) {
    copyFileSync(join(uploads, filename), join(target, filename));
  }
}

const variantCount = readdirSync(join(target, 'variants')).length;
console.log(`Packaged ${variantCount} optimized demo image variants for deployment`);
