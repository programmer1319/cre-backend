import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Lead } from "./leads.entity";
import { Repository } from "typeorm";

@Injectable()
export class LeadsService {

  constructor(
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
  ) {}

  create(data: any) {
    const lead = this.leadRepo.create(data);
    return this.leadRepo.save(lead);
  }

  findAll() {
    return this.leadRepo.find({
      relations: ['property'],
      order: { createdAt: 'DESC' },
    });
  }
}