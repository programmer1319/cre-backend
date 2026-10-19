import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { CreateContactDto } from './contact.dto';
import { ContactMessage, ContactStatus } from './contact-message.entity';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  constructor(@InjectRepository(ContactMessage) private readonly repo: Repository<ContactMessage>, private readonly mail: MailService, private readonly config: ConfigService) {}
  async create(dto: CreateContactDto) {
    const recipient = this.config.get<string>('CONTACT_TO')?.trim();
    if (!recipient) throw new ServiceUnavailableException('Contact email recipient is not configured');
    const item = await this.repo.save(this.repo.create({ ...dto, company: dto.company ?? null }));
    const delivery = await this.mail.send({ to: recipient, replyTo: dto.email, subject: `Website enquiry from ${dto.name}`, text: `${dto.name}${dto.company ? ` (${dto.company})` : ''}\n${dto.email}\n\n${dto.message}` });
    this.logger.log(`Contact email accepted by SMTP for ${recipient}; message ID ${delivery.messageId}`);
    return { id: item.id, message: 'Your enquiry has been sent.' };
  }
  findAll() { return this.repo.find({ order: { createdAt: 'DESC' } }); }
  async updateStatus(id: number, status: ContactStatus) { const item = await this.repo.findOne({ where: { id } }); if (!item) throw new NotFoundException('Message not found'); item.status = status; return this.repo.save(item); }
  async remove(id: number) { const item = await this.repo.findOne({ where: { id } }); if (!item) throw new NotFoundException('Message not found'); await this.repo.remove(item); return { message: 'Message removed' }; }
}
