import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    const defaultUsers: CreateUserInput[] = [
      {
        email: 'admin@example.com',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
      },
      {
        email: 'user1@example.com',
        username: 'user1',
        password: 'password1',
        role: 'user',
      },
      {
        email: 'user2@example.com',
        username: 'user2',
        password: 'password2',
        role: 'user',
      },
      {
        email: 'user3@example.com',
        username: 'user3',
        password: 'password3',
        role: 'user',
      },
      {
        email: 'user4@example.com',
        username: 'user4',
        password: 'password4',
        role: 'user',
      },
      {
        email: 'user5@example.com',
        username: 'user5',
        password: 'password5',
        role: 'user',
      },
    ];

    for (const u of defaultUsers) {
      const existing = await this.findOneByUsername(u.username);
      if (!existing) {
        await this.create(u);
      }
    }

    console.log('✅ Users soft-seeded (pokud chyběli)');
  }

  async create(input: CreateUserInput): Promise<User> {
    const existingEmail = await this.findOneByEmail(input.email);
    if (existingEmail) {
      throw new BadRequestException(
        `Uživatel s emailem ${input.email} již existuje`,
      );
    }

    const existingUsername = await this.findOneByUsername(input.username);
    if (existingUsername) {
      throw new BadRequestException(
        `Uživatel s uživatelským jménem ${input.username} již existuje`,
      );
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = this.userRepository.create({
      email: input.email,
      username: input.username,
      password: hashedPassword,
      role: input.role ?? 'user',
    });

    return this.userRepository.save(user);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Uživatel s ID ${id} nebyl nalezen`);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async update(id: number, input: UpdateUserInput): Promise<User> {
    const user = await this.findOneById(id);

    if (input.email !== undefined && input.email !== user.email) {
      const existing = await this.findOneByEmail(input.email);
      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Uživatel s emailem ${input.email} již existuje`,
        );
      }
      user.email = input.email;
    }

    if (input.username !== undefined && input.username !== user.username) {
      const existing = await this.findOneByUsername(input.username);
      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Uživatel s uživatelským jménem ${input.username} již existuje`,
        );
      }
      user.username = input.username;
    }

    if (input.role !== undefined && input.role !== user.role) {
      if (user.role === 'admin' && input.role === 'user') {
        const adminCount = await this.userRepository.count({
          where: { role: 'admin' },
        });
        if (adminCount <= 1) {
          throw new BadRequestException(
            'Nelze odebrat roli poslednímu adminovi',
          );
        }
      }
      user.role = input.role;
    }

    if (input.password !== undefined) {
      user.password = await bcrypt.hash(input.password, 10);
    }

    return this.userRepository.save(user);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(`Uživatel s ID ${id} nebyl nalezen`);
    }
    return true;
  }
}
