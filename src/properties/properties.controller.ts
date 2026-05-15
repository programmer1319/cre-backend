import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { Property } from './property.entity';
import { JwtGuard } from '../auth/jwt/jwt.guard';

@Controller('properties')
export class PropertiesController {
  constructor(private propertyService: PropertiesService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() body: Partial<Property>) {
    const imageUrl = body.images || 'https://placehold.co/1020x768.webp';
    body.images = [...imageUrl];
    return this.propertyService.create(body);
  }

  @Get()
  findAll() {
    return this.propertyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updates: Partial<Property>) {
    return this.propertyService.update(id, updates);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertyService.remove(id);
  }
}
