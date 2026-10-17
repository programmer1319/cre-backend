import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactController } from './contact.controller';
import { ContactMessage } from './contact-message.entity';
import { ContactService } from './contact.service';

@Module({ imports: [TypeOrmModule.forFeature([ContactMessage])], controllers: [ContactController], providers: [ContactService] })
export class ContactModule {}
