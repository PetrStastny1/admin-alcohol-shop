import { Resolver, Mutation, Args, Query, ObjectType, Field, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './gql-auth.guard';

@ObjectType()
export class LoginResponse {
  @Field()
  access_token!: string;
}

@ObjectType()
export class MeAdminResponse {
  @Field()
  id!: number;

  @Field()
  username!: string;

  @Field()
  role!: string;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  // --- Mutations ---
  @Mutation(() => LoginResponse)
  async loginAdmin(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<LoginResponse> {
    try {
      return await this.authService.loginAdmin(username, password);
    } catch {
      throw new UnauthorizedException('Neplatné uživatelské jméno nebo heslo');
    }
  }

  // --- Queries ---
  @Query(() => MeAdminResponse)
  @UseGuards(GqlAuthGuard)
  meAdmin(@Context() ctx: any): MeAdminResponse {
    const admin = ctx.req.user;
    if (!admin) throw new UnauthorizedException('Neautorizovaný přístup');
    return {
      id: admin.sub,
      username: admin.username,
      role: admin.role,
    };
  }
}
