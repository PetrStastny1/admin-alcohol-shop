import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Vytvoření uživatele s hashováním hesla
  async create(email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ email, password: hashedPassword });
    return this.userRepository.save(user);
  }

  // Najdi jednoho uživatele podle emailu
  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOneBy({ email });
    return user || undefined; // Převod null -> undefined
  }

  // Najdi jednoho uživatele podle ID
  async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Najdi všechny uživatele
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}