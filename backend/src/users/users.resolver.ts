import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [User], { name: 'users' })
  async getUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'user' })
  async getUser(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, { name: 'createUser' })
  async createUser(
    @Args('input') input: CreateUserInput,
  ): Promise<User> {
    return this.usersService.create(input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, { name: 'updateUser' })
  async updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateUserInput,
  ): Promise<User> {
    return this.usersService.update(id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { name: 'deleteUser' })
  async deleteUser(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.usersService.delete(id);
  }
}
