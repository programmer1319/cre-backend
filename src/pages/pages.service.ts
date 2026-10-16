import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Page } from './entities/page.entity';
import { Repository } from 'typeorm';
import { Section } from 'src/sections/entities/section.entity';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page) private pageRepo: Repository<Page>,
    @InjectRepository(Section) private sectionRepo: Repository<Section>,
  ) {}

  create(createPageDto: CreatePageDto) {
    return this.pageRepo.save(this.pageRepo.create({ ...createPageDto, isActive: createPageDto.isActive ?? true }));
  }

  findAll() {
    return this.pageRepo.find({
      relations: ['sections'],
      order: { title: 'ASC', sections: { sortOrder: 'ASC' } },
    });
  }

  async updatePage(slug: string, updatePageDto: UpdatePageDto) {
    const page = await this.pageRepo.findOne({ where: { slug }, relations: ['sections'] });
    if (!page) throw new NotFoundException(`Page '${slug}' not found`);
    if (updatePageDto.title !== undefined) page.title = updatePageDto.title;
    if (updatePageDto.metaTitle !== undefined) page.metaTitle = updatePageDto.metaTitle;
    if (updatePageDto.metaDescription !== undefined)
      page.metaDescription = updatePageDto.metaDescription;
    if (updatePageDto.isActive !== undefined) page.isActive = updatePageDto.isActive;
    return this.pageRepo.save(page);
  }

  async findOne(slug: string) {
    const page = await this.pageRepo.findOne({
      where: { slug, isActive: true },
      relations: ['sections'],
    });

    if (!page) throw new NotFoundException(`Page '${slug}' not found`);

    const sections = page.sections
      .filter((s) => s.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .reduce<Record<string, unknown>>((acc, section) => {
        acc[section.sectionKey] = {
          ...section.content,
          heroImage: section.heroImage,
          thumbnail: section.thumbnail,
          galleryIds: section.galleryIds,
        };
        return acc;
      }, {});

    return {
      ...page,
      sections,
    };
  }

  async update(slug: string, sectionKey: string, updatePageDto: UpdatePageDto) {
    const page = await this.pageRepo.findOne({ where: { slug } });
    if (!page) throw new NotFoundException(`Page '${slug}' not found`);
    const section = await this.sectionRepo.findOne({ where: { pageId: page.id, sectionKey } });
    if (!section) throw new NotFoundException(`Section '${sectionKey}' not found`);
    if (updatePageDto.title !== undefined) page.title = updatePageDto.title;
    if (updatePageDto.metaTitle !== undefined) page.metaTitle = updatePageDto.metaTitle;
    if (updatePageDto.metaDescription !== undefined) page.metaDescription = updatePageDto.metaDescription;
    if (updatePageDto.isActive !== undefined) page.isActive = updatePageDto.isActive;
    await this.pageRepo.save(page);
    return this.findOne(slug);
  }

  async remove(slug: string) {
    const page = await this.pageRepo.findOne({ where: { slug } });
    if (!page) throw new NotFoundException(`Page '${slug}' not found`);
    await this.pageRepo.remove(page);
    return { message: 'Page removed successfully' };
  }
}
