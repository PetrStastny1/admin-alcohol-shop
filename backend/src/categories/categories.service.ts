import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // ✅ Seed dat při startu
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
        await this.create(cat.name, cat.description);
      }
    }

    console.log('✅ Categories seeded (pokud chyběly)');
  }

  // ✅ Načti všechny kategorie
  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ relations: ['products'] });
  }

  // ✅ Najdi kategorii podle ID
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

  // ✅ Vytvoř novou kategorii
  async create(name: string, description?: string): Promise<Category> {
    const existing = await this.categoryRepository.findOne({ where: { name } });
    if (existing) {
      throw new BadRequestException(`Kategorie "${name}" už existuje`);
    }

    const category = this.categoryRepository.create({ name, description });
    return this.categoryRepository.save(category);
  }

  // ✅ Aktualizuj kategorii
  async update(
    id: number,
    name?: string,
    description?: string,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (name && name !== category.name) {
      const existing = await this.categoryRepository.findOne({ where: { name } });
      if (existing) {
        throw new BadRequestException(`Kategorie "${name}" už existuje`);
      }
      category.name = name;
    }

    if (description !== undefined) {
      category.description = description;
    }

    return this.categoryRepository.save(category);
  }

  // ✅ Smaž kategorii
  async delete(id: number): Promise<boolean> {
    const result = await this.categoryRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Kategorie s ID ${id} nenalezena`);
    }
    return true;
  }
}
