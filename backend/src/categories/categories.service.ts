import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

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
      { name: 'Rum', description: 'Různé druhy rumu' },
      { name: 'Likéry', description: 'Sladké likéry a aperitivy' },
      { name: 'Brandy', description: 'Různé druhy brandy' },
    ];

    for (const cat of defaultCategories) {
      const exists = await this.categoryRepository.findOne({ where: { name: cat.name } });
      if (!exists) {
        await this.create(cat.name, cat.description);
      }
    }
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
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(name: string, description?: string): Promise<Category> {
    const existing = await this.categoryRepository.findOne({ where: { name } });
    if (existing) return existing;

    const category = this.categoryRepository.create({ name, description });
    return this.categoryRepository.save(category);
  }

  async update(id: number, name?: string, description?: string): Promise<Category> {
    const category = await this.findOne(id);
    if (name) category.name = name;
    if (description) category.description = description;
    return this.categoryRepository.save(category);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.categoryRepository.delete(id);
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return true;
  }
}
