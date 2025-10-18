import { Controller, Post, Body, Get, Param, ParseIntPipe, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ Vytvoření uživatele
  @Post()
  async createUser(@Body() createUserInput: CreateUserInput): Promise<User> {
    return this.usersService.create(createUserInput);
  }

  // ✅ Získání všech uživatelů
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // ✅ Získání uživatele podle ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findOneById(id);
  }

  // ✅ Aktualizace uživatele
  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.usersService.update({ ...updateUserInput, id });
  }

  // ✅ Smazání uživatele
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
    return this.usersService.delete(id);
  }
}
