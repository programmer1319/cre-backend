import { Module } from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { FavouritesController } from './favourites.controller';
import { Property } from 'src/properties/property.entity';
import { User } from 'src/users/user.entity';
import { TypeOrmModule } from 'node_modules/@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Property])],
  controllers: [FavouritesController],
  providers: [FavouritesService],
})
export class FavouritesModule {}
