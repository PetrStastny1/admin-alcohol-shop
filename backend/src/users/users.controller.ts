import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() body: { email: string; password: string }): Promise<User> {
    const { email, password } = body;
    return this.usersService.create(email, password);
  }
}
