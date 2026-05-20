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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ConfigService } from '@nestjs/config';
import { PropertiesService } from './properties.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard'; 
import { Roles } from 'src/users/roles.decorater'; 
import { UserRole } from '../users/user-role.enum';
import { FilterPropertyDto } from './filter-property.dto';
import { MapBoundsDto } from './map-bounds.dto';

const uploadInterceptor = () =>
  UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, name + extname(file.originalname));
        },
      }),
    }),
  );

@Controller('properties')
export class PropertiesController {
  constructor(
    private propertyService: PropertiesService,
    private configService: ConfigService,
  ) {}

  private get baseUrl() {
    return this.configService.get<string>('BASE_URL')!;
  }

  private transform(body: any, files: Express.Multer.File[]) {
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
      images: files?.map((f) => `${this.baseUrl}/uploads/${f.filename}`) ?? [],
    };
  }

  // ── PUBLIC ───────────────────────────────────────────────
  @Get()
  findAll(@Query() query: FilterPropertyDto) {
    return this.propertyService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
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
    @Body() body: any,
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
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    return this.propertyService.update(
      id,
      body,
      files,
      this.baseUrl,
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
