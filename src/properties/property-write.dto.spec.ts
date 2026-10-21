import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { PropertyWriteDto } from './property-write.dto';

describe('Property multipart validation', () => {
  const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
  const fields = {
    title: 'Office listing', description: 'A commercial office listing.', city: 'Austin',
    location: 'Central district', propertyType: 'Office', price: '72', area: '12800',
    bedrooms: '0', bathrooms: '2', latitude: '30.2', longitude: '-97.7', featured: 'false',
    amenities: '["Reception"]',
  };
  const validate = (documents: unknown) => pipe.transform({ ...fields, documents }, {
    type: 'body', metatype: PropertyWriteDto,
  }) as Promise<PropertyWriteDto>;

  it('accepts retained documents from a multipart JSON field', async () => {
    const documents = [{ title: 'Brochure', url: 'https://example.test/uploads/brochure.pdf' }];
    const body = await validate(JSON.stringify(documents));
    expect(body.documents).toEqual(documents);
    expect(body.price).toBe(72);
    expect(body.featured).toBe(false);
  });

  it('also accepts JSON requests and an empty retained document list', async () => {
    expect((await validate([{ title: 'Brochure', url: '/uploads/brochure.pdf' }])).documents).toHaveLength(1);
    expect((await validate('[]')).documents).toEqual([]);
  });

  it.each([
    '[{"title":"Brochure","url":"javascript:alert(1)"}]',
    '[{"title":"Brochure","url":"/uploads/brochure.pdf","unexpected":true}]',
    '{"title":"Brochure"}', 'not json',
  ])('still rejects unsafe or malformed nested data: %s', async (documents) => {
    await expect(validate(documents)).rejects.toBeInstanceOf(BadRequestException);
  });
});
