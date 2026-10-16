import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { ConfigModule } from '@nestjs/config';
import { FavouritesModule } from './favourites/favourites.module';
import { LeadsModule } from './leads/leads.module';
import { NotificationModule } from './notification/notification.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PagesModule } from './pages/pages.module';
import { MediaModule } from './media/media.module';
import { SectionsModule } from './sections/sections.module';
import { SettingsModule } from './settings/settings.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: 3306,
      username: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASS ?? 'admin',
      database: process.env.DB_NAME ?? 'real_estate',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    UsersModule,
    AuthModule,
    PropertiesModule,
    FavouritesModule,
    LeadsModule,
    NotificationModule,
    AnalyticsModule,
    PagesModule,
    MediaModule,
    SectionsModule,
    SettingsModule,
  ],
  // CacheModule.register({ ttl: 300, max: 100 }),
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
