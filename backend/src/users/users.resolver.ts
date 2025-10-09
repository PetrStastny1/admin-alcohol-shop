import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserInput } from './dto/create-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // Dotaz pro získání všech uživatelů
  @Query(() => [User], { name: 'users' })
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // Dotaz pro získání konkrétního uživatele podle ID
  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Number }) id: number): Promise<User> {
    return this.usersService.findOneById(id);
  }

  // Mutace pro vytvoření nového uživatele
  @Mutation(() => User)
  createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    const { email, password } = createUserInput;
    return this.usersService.create(email, password);
  }
}
