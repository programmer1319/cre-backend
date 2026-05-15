import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { FavouritesService } from './favourites.service';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';
@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @UseGuards(JwtGuard)
  @Get()
  get(@Req() req: Request & { user: { id: number } }) {
    return this.favouritesService.getFavorites(req.user.id);
  }

  @UseGuards(JwtGuard)
  @Post(':id')
  add(@Req() req: Request & { user: { id: number } }, @Param('id') id: string) {
    return this.favouritesService.addFavorite(req.user.id, Number(id));
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(
    @Req() req: Request & { user: { id: number } },
    @Param('id') id: number,
  ) {
    return this.favouritesService.removeFavorite(req.user.id, id);
  }
}
