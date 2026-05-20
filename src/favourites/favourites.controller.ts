import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';
import { FavouritesService } from './favourites.service';

@Controller('favorites')
export class FavouritesController {
  constructor(private favoritesService: FavouritesService) {}

  @UseGuards(JwtGuard)
  @Post(':propertyId')
  toggle(@Req() req, @Param('propertyId') propertyId: string) {
    return this.favoritesService.toggle(req.user.id, Number(propertyId));
  }

  @UseGuards(JwtGuard)
  @Get()
  getFavorites(@Req() req) {
    return this.favoritesService.getUserFavorites(req.user.id);
  }
}
