import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lead } from './leads.entity';
import { Repository } from 'typeorm';
import { Property } from 'src/properties/property.entity';
import { NotificationsGateway } from 'src/notification/notification.gateway';
import { NotificationService } from 'src/notification/notification.service';
import { CreateLeadDto } from './create-lead.dto';
import { SettingsService } from 'src/settings/settings.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class LeadsService {
  constructor(
    private notificationService: NotificationService,
    private settingsService: SettingsService,
    private mailService: MailService,
    private gateway: NotificationsGateway,
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
  ) {}

  async create(data: CreateLeadDto) {
    const property = await this.propertyRepo.findOne({
      where: {
        id: Number(data.property),
        visibility: 'published',
      },
      relations: ['owner'],
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    const notification = await this.notificationService.create(
      property.owner.id,
      `New inquiry for ${property.title}`,
      'lead',
      property.id,
    );
    const settings = await this.settingsService.findForUser(property.owner.id);
    if (settings.pushNewLeads) {
      this.gateway.sendNotification(property.owner.id, notification);
    }

    const lead = await this.leadRepo.save(this.leadRepo.create({
      name: data.name,
      email: data.email,
      message: data.message,
      property,
    }));
    if (settings.emailNewLeads && property.owner.email) {
      await this.mailService.send({ to: property.owner.email, replyTo: data.email, subject: `New enquiry for ${property.title}`, text: `${data.name}\n${data.email}\n\n${data.message}` }).catch(() => undefined);
    }
    return this.publicLead(lead);
  }

  /**
   * Enquiries visible to the requesting user.
   *
   * Admins see the whole pipeline; an agent sees only enquiries raised against properties they
   * own. Without the scope every agent could read every other agent's contact details, which is
   * both a privacy problem and commercially sensitive.
   */
  findAll(user: { id: number; role: string }) {
    const qb = this.leadRepo
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.property', 'property')
      .leftJoin('property.owner', 'owner')
      .orderBy('lead.createdAt', 'DESC');

    if (user.role !== 'admin') {
      qb.where('owner.id = :ownerId', { ownerId: user.id });
    }

    return qb.getMany();
  }

  async updateStatus(
    id: number,
    status: Lead['status'],
    user: { id: number; role: string },
  ) {
    const lead = await this.leadRepo.findOne({
      where: { id },
      relations: ['property', 'property.owner'],
    });
    if (!lead) throw new NotFoundException('Enquiry not found');

    this.assertOwnerOrAdmin(lead, user);

    lead.status = status;
    return this.publicLead(await this.leadRepo.save(lead));
  }

  async remove(id: number, user: { id: number; role: string }) {
    const lead = await this.leadRepo.findOne({
      where: { id },
      relations: ['property', 'property.owner'],
    });
    if (!lead) throw new NotFoundException('Enquiry not found');

    this.assertOwnerOrAdmin(lead, user);

    await this.leadRepo.remove(lead);
    return { message: 'Enquiry removed' };
  }

  /** An enquiry belongs to whoever owns the property it was raised against. */
  private publicLead(lead: Lead) {
    // Write handlers load the owner for authorization/mail. Never serialize that user entity:
    // it includes password and tokenVersion, which are not part of the enquiry contract.
    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      message: lead.message,
      status: lead.status,
      createdAt: lead.createdAt,
      property: lead.property ? { id: lead.property.id, title: lead.property.title } : null,
    };
  }

  private assertOwnerOrAdmin(lead: Lead, user: { id: number; role: string }) {
    if (user.role === 'admin') return;
    if (Number(lead.property?.owner?.id) !== Number(user.id)) {
      throw new ForbiddenException('This enquiry belongs to another agent');
    }
  }
}
