import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Section } from './entities/section.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SectionsService {
  constructor(@InjectRepository(Section) private repo: Repository<Section>) {}

  create(createSectionDto: CreateSectionDto) {
    return this.repo.save(this.repo.create(createSectionDto));
  }

  findAll() {
    return this.repo.find({ order: { sortOrder: 'ASC' } });
  }

  async findOne(id: number) {
    const section = await this.repo.findOne({ where: { id } });
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  async update(id: number, updateSectionDto: UpdateSectionDto) {
    const section = await this.findOne(id);
    return this.repo.save(this.repo.merge(section, updateSectionDto));
  }

  async remove(id: number) {
    const section = await this.findOne(id);
    await this.repo.remove(section);
    return { message: 'Section removed successfully' };
  }
}
