import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { ContactService } from './contact.service';
import { ContactMessage } from './contact-message.entity';

describe('ContactService', () => {
  it('does not save a message without a configured destination', async () => {
    const repo = { save: jest.fn(), create: jest.fn() } as unknown as Repository<ContactMessage>;
    const mail = { send: jest.fn() } as unknown as MailService;
    const config = { get: jest.fn().mockReturnValue('') } as unknown as ConfigService;
    const service = new ContactService(repo, mail, config);
    await expect(service.create({ name: 'Test visitor', email: 'visitor@example.com', message: 'A test contact message.' }))
      .rejects.toThrow('Contact email recipient is not configured');
    expect(repo.save).not.toHaveBeenCalled();
    expect(mail.send).not.toHaveBeenCalled();
  });
});
