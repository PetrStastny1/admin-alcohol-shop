import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from './gql-auth.guard';
import { LoginResponseDto } from './dto/login-response.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  // 🔹 Přihlášení pomocí uživatelského jména
  @Mutation(() => LoginResponseDto, { name: 'login' })
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<LoginResponseDto> {
    const result = await this.authService.loginUser(username, password);

    return {
      access_token: result.access_token,
      id: result.user.id,
      username: result.user.username,
      role: result.user.role,
    };
  }

  // 🔹 Vrátí aktuálního přihlášeného uživatele
  @Query(() => LoginResponseDto, { name: 'me' })
  @UseGuards(GqlAuthGuard)
  async me(@Context() ctx: any): Promise<LoginResponseDto> {
    const payload = ctx.req.user;
    if (!payload) {
      throw new UnauthorizedException('Neautorizovaný přístup');
    }

    return {
      access_token: '',
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
