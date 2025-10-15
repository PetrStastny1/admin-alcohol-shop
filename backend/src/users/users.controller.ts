import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserInput } from './dto/create-user.input';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ Vytvoření uživatele
  @Post()
  async createUser(@Body() createUserInput: CreateUserInput): Promise<User> {
    return this.usersService.create(createUserInput);
  }

  // ✅ (bonus) Získání všech uživatelů
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // ✅ (bonus) Získání uživatele podle ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findOneById(id);
  }
}
