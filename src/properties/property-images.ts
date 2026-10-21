import sharp from 'sharp';
import { basename, extname, join } from 'node:path';
import { mkdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';

export interface PropertyImageVariants {
  source: string;
  gallery: string;
  card: string;
  thumbnail: string;
}

const VARIANT_DIRECTORY = join('uploads', 'variants');

const variantFilename = (filename: string, kind: 'gallery' | 'card' | 'thumb') =>
  `${basename(filename, extname(filename))}-${kind}.webp`;

export const propertyVariantPaths = (filename: string) => ({
  gallery: join(VARIANT_DIRECTORY, variantFilename(filename, 'gallery')),
  card: join(VARIANT_DIRECTORY, variantFilename(filename, 'card')),
  thumbnail: join(VARIANT_DIRECTORY, variantFilename(filename, 'thumb')),
});

/** Legacy uploads may predate variant generation; only advertise files that are actually present. */
export function hasPropertyImageVariants(filename: string): boolean {
  const paths = propertyVariantPaths(filename);
  return existsSync(paths.gallery) && existsSync(paths.card) && existsSync(paths.thumbnail);
}

/**
 * Builds the three crops used by the product while retaining the uploaded source.
 * `cover` uses a centred crop only where the source ratio differs from the target.
 */
export async function createPropertyImageVariants(files: Express.Multer.File[] = []) {
  await mkdir(VARIANT_DIRECTORY, { recursive: true });

  for (const file of files) {
    const paths = propertyVariantPaths(file.filename);
    const source = sharp(file.path).rotate();
    await Promise.all([
      source.clone().resize(1600, 1067, { fit: 'cover', position: 'centre', withoutEnlargement: true }).webp({ quality: 88 }).toFile(paths.gallery),
      source.clone().resize(720, 540, { fit: 'cover', position: 'centre', withoutEnlargement: true }).webp({ quality: 84 }).toFile(paths.card),
      source.clone().resize(240, 180, { fit: 'cover', position: 'centre', withoutEnlargement: true }).webp({ quality: 80 }).toFile(paths.thumbnail),
    ]);
  }
}

export async function removePropertyImageFiles(filenames: string[] = []) {
  await Promise.all(
    filenames.flatMap((filename) => {
      const paths = propertyVariantPaths(filename);
      return [
        unlink(join('uploads', filename)).catch(() => undefined),
        unlink(paths.gallery).catch(() => undefined),
        unlink(paths.card).catch(() => undefined),
        unlink(paths.thumbnail).catch(() => undefined),
      ];
    }),
  );
}

export async function removePropertyDocumentFiles(urls: string[] = []) {
  await Promise.all(
    urls
      .filter((url) => url.startsWith('/uploads/'))
      .map((url) => unlink(join('uploads', basename(url))).catch(() => undefined)),
  );
}

export function publicPropertyImageVariants(filename: string, baseUrl: string): PropertyImageVariants {
  const paths = propertyVariantPaths(filename);
  const publicUrl = (path: string) => `${baseUrl}/${path.replaceAll('\\', '/')}`;
  return {
    source: publicUrl(join('uploads', filename)),
    gallery: publicUrl(paths.gallery),
    card: publicUrl(paths.card),
    thumbnail: publicUrl(paths.thumbnail),
  };
}
