import { Module } from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { FavouritesController } from './favourites.controller';
import { TypeOrmModule } from 'node_modules/@nestjs/typeorm';
import { Favorite } from './favourites.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite])],
  controllers: [FavouritesController],
  providers: [FavouritesService],
})
export class FavouritesModule {}
