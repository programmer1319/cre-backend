import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserRole } from 'src/users/user-role.enum';
import { Roles } from 'src/users/roles.decorater';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(createPageDto);
  }

  @Get(':slug')
  @UseInterceptors(CacheInterceptor)
  async getPage(@Param('slug') slug: string) {
    return this.pagesService.findOne(slug);
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.pagesService.findAll();
  }

  @Patch(':slug')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updatePage(@Param('slug') slug: string, @Body() body: UpdatePageDto) {
    return this.pagesService.updatePage(slug, body);
  }

  @Patch(':slug/sections/:sectionKey')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('slug') slug: string,
    @Param('sectionKey') sectionKey: string,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    return this.pagesService.update(slug, sectionKey, updatePageDto);
  }

  @Delete(':slug')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('slug') slug: string) {
    return this.pagesService.remove(slug);
  }
}
