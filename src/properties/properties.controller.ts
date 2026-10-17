import {
  Body,
  Controller,
  Delete,
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
import { FilesInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/users/roles.decorater';
import { UserRole } from '../users/user-role.enum';
import { FilterPropertyDto } from './filter-property.dto';
import { MapBoundsDto } from './map-bounds.dto';
import { PropertyWriteDto } from './property-write.dto';
import { multerConfig } from 'src/config/upload.config';

const uploadInterceptor = () =>
  UseInterceptors(
    FilesInterceptor('images', 10, multerConfig),
  );

@Controller('properties')
export class PropertiesController {
  constructor(private propertyService: PropertiesService) {}

  private transform(body: PropertyWriteDto, files: Express.Multer.File[]) {
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
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      images: files?.map((f) => f.filename) ?? [],
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
  create(
    @Req() req: any,
    @Body() body: PropertyWriteDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.propertyService.create({
      ...this.transform(body, files),
      owner: { id: req.user.id } as any,
    });
  }

  // ── OWNER or ADMIN: UPDATE ───────────────────────────────
  @UseGuards(JwtGuard)
  @Patch(':id')
  @uploadInterceptor()
  update(
    @Param('id') id: number,
    @Body() body: PropertyWriteDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    return this.propertyService.update(
      id,
      body,
      files,
      req.user, // ownership check is inside the service
    );
  }

  // ── OWNER or ADMIN: DELETE ───────────────────────────────
  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.propertyService.remove(id, req.user);
  }
}
