import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/users/roles.decorater';
import { UserRole } from '../users/user-role.enum';
import { FilterPropertyDto } from './filter-property.dto';
import { MapBoundsDto } from './map-bounds.dto';
import { PropertyWriteDto } from './property-write.dto';
import { propertyUploadConfig } from 'src/config/upload.config';
import { open, unlink } from 'node:fs/promises';
import sharp from 'sharp';
import { createPropertyImageVariants, removePropertyImageFiles } from './property-images';

const uploadInterceptor = () =>
  UseInterceptors(
    FileFieldsInterceptor([{ name: 'images', maxCount: 10 }, { name: 'documents', maxCount: 5 }], propertyUploadConfig),
  );

type PropertyFiles = { images?: Express.Multer.File[]; documents?: Express.Multer.File[] };
const removeUploads = async (files: PropertyFiles) => {
  await Promise.all((files?.documents ?? []).map((file) => unlink(file.path).catch(() => undefined)));
  await removePropertyImageFiles((files?.images ?? []).map((file) => file.filename));
};

async function validateUploads(files: PropertyFiles) {
  try {
    for (const image of files?.images ?? []) {
      const { format } = await sharp(image.path).metadata();
      if (!['jpeg', 'png', 'webp', 'avif'].includes(format ?? '')) throw new Error('Invalid image');
    }
    for (const document of files?.documents ?? []) {
      const file = await open(document.path, 'r');
      try {
        const header = Buffer.alloc(5);
        await file.read(header, 0, 5, 0);
        if (header.toString() !== '%PDF-') throw new Error('Invalid PDF');
      } finally {
        await file.close();
      }
    }
  } catch {
    await removeUploads(files);
    throw new BadRequestException('Uploaded files must be valid images or PDFs');
  }
}

@Controller('properties')
export class PropertiesController {
  constructor(private propertyService: PropertiesService) {}

  private transform(body: PropertyWriteDto, files: PropertyFiles) {
    return {
      title: body.title,
      description: body.description,
      city: body.city,
      location: body.location,
      propertyType: body.propertyType,
      price: Number(body.price),
      area: Number(body.area),
      bedrooms: Number(body.bedrooms),
      bathrooms: Number(body.bathrooms),
      floor: body.floor?.trim() || null,
      workstations: Number(body.workstations ?? 0),
      parkingSpaces: Number(body.parkingSpaces ?? 0),
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      images: files?.images?.map((f) => f.filename) ?? [],
      transactionType: body.transactionType ?? 'sale',
      status: body.status ?? 'available',
      visibility: body.visibility ?? 'published',
      priceUnit: body.priceUnit ?? null,
      featured: body.featured ?? false,
      amenities: body.amenities ?? [],
      documents: [
        ...(body.documents ?? []),
        ...(files.documents ?? []).map((file) => ({ title: file.originalname, url: `/uploads/${file.filename}` })),
      ],
    };
  }

  // ── PUBLIC ───────────────────────────────────────────────
  @Get()
  findAll(@Query() query: FilterPropertyDto) {
    return this.propertyService.findAll(query);
  }

  @Get('featured')
  getFeatured() {
    return this.propertyService.findFeatured();
  }

  // Must stay above `@Get(':slug')` — Nest matches in declaration order and the param route
  // would otherwise swallow the literal path and look up a property named "facets".
  @Get('facets')
  getFacets() {
    return this.propertyService.findFacets();
  }

  // Same ordering constraint as `facets` above.
  @Get('pins')
  getPins(@Query() query: FilterPropertyDto) {
    return this.propertyService.findPins(query);
  }

  @Get('admin')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  findAllForManagement(@Query() query: FilterPropertyDto, @Req() req: { user: { id: number; role: string } }) {
    return this.propertyService.findAll({
      ...query,
      ownerId: req.user.role === 'admin' ? query.ownerId : String(req.user.id),
    }, true);
  }

  @Get('admin/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async findOneForManagement(@Param('id') id: string, @Req() req: { user: { id: number; role: string } }) {
    const property = await this.propertyService.findOne(id, true);
    if (req.user.role !== 'admin' && Number(property.owner?.id) !== req.user.id) {
      throw new ForbiddenException('You do not own this property');
    }
    return property;
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.propertyService.findOne(slug);
  }

  @Post('bounds')
  findWithinBounds(@Body() bounds: MapBoundsDto) {
    return this.propertyService.findWithinBounds(bounds);
  }

  // ── AGENT + ADMIN: CREATE ────────────────────────────────
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @Post()
  @uploadInterceptor()
  async create(
    @Req() req: any,
    @Body() body: PropertyWriteDto,
    @UploadedFiles() files: PropertyFiles,
  ) {
    await validateUploads(files);
    try {
      await createPropertyImageVariants(files?.images);
      return await this.propertyService.create({
        ...this.transform(body, files),
        owner: { id: req.user.id } as any,
      });
    } catch (error) {
      await removeUploads(files);
      throw error;
    }
  }

  // ── OWNER or ADMIN: UPDATE ───────────────────────────────
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @Patch(':id')
  @uploadInterceptor()
  async update(
    @Param('id') id: number,
    @Body() body: PropertyWriteDto,
    @UploadedFiles() files: PropertyFiles,
    @Req() req: any,
  ) {
    await validateUploads(files);
    try {
      await createPropertyImageVariants(files?.images);
      return await this.propertyService.update(id, body, files, req.user);
    } catch (error) {
      await removeUploads(files);
      throw error;
    }
  }

  // ── OWNER or ADMIN: DELETE ───────────────────────────────
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.propertyService.remove(id, req.user);
  }
}
