import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    const defaultCategories = [
      { name: 'Whisky', description: 'Různé druhy whisky' },
      { name: 'Vodka', description: 'Různé druhy vodky' },
      { name: 'Rum', description: 'Tmavý, světlý a ochucený rum' },
      { name: 'Likéry', description: 'Sladké likéry a aperitivy' },
      { name: 'Brandy', description: 'Různé druhy brandy' },
      { name: 'Víno', description: 'Červená, bílá a růžová vína' },
      { name: 'Pivo', description: 'Ležáky, speciály a craft piva' },
      { name: 'Gin', description: 'Tradiční i moderní giny' },
      { name: 'Tequila', description: 'Blanco, reposado a añejo tequila' },
      { name: 'Šampaňské', description: 'Luxusní šumivá vína a sekty' },
    ];

    for (const cat of defaultCategories) {
      const exists = await this.categoryRepository.findOne({
        where: { name: cat.name },
      });
      if (!exists) {
        const category = this.categoryRepository.create(cat);
        await this.categoryRepository.save(category);
      }
    }

    console.log('✅ Categories seeded (pokud chyběly)');
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ relations: ['products'] });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!category) {
      throw new NotFoundException(`Kategorie s ID ${id} nenalezena`);
    }
    return category;
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const existing = await this.categoryRepository.findOne({
      where: { name: input.name },
    });
    if (existing) {
      throw new BadRequestException(`Kategorie "${input.name}" už existuje`);
    }

    const category = this.categoryRepository.create(input);
    return this.categoryRepository.save(category);
  }

  async update(input: UpdateCategoryInput): Promise<Category> {
    const category = await this.findOne(input.id);

    if (input.name && input.name !== category.name) {
      const existing = await this.categoryRepository.findOne({
        where: { name: input.name },
      });
      if (existing) {
        throw new BadRequestException(`Kategorie "${input.name}" už existuje`);
      }
      category.name = input.name;
    }

    if (input.description !== undefined) {
      category.description = input.description;
    }

    return this.categoryRepository.save(category);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.categoryRepository.delete(id);
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(`Kategorie s ID ${id} nenalezena`);
    }
    return true;
  }
}
