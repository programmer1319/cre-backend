import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { UserRole } from 'src/users/user-role.enum';
import { Roles } from 'src/users/roles.decorater';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/upload.config';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // Single image (hero, thumbnail, avatar)
  @Post('upload')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.mediaService.saveUpload(file);
  }

  // Multiple images (property gallery, team section)
  @Post('upload/bulk')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @UseInterceptors(FilesInterceptor('files', 20, multerConfig))
  async uploadBulk(@UploadedFiles() files: Express.Multer.File[]) {
    return Promise.all(files.map((f) => this.mediaService.saveUpload(f)));
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.mediaService.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: { altText?: string }) {
    return this.mediaService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(id);
  }
}
