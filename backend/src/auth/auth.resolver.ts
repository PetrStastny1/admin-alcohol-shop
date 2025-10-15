import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from './gql-auth.guard';

// DTOs
import { AdminDto } from './dto/admin.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  // --- LOGIN ADMIN ---
  @Mutation(() => LoginResponseDto)
  async loginAdmin(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<LoginResponseDto> {
    const result = await this.authService.loginAdmin(username, password);
    if (!result) {
      throw new UnauthorizedException('Neplatné uživatelské jméno nebo heslo');
    }
    return {
      access_token: result.access_token,
      admin: {
        id: result.admin.id,
        username: result.admin.username,
      },
    };
  }

  // --- WHOAMI ---
  @Query(() => AdminDto)
  @UseGuards(GqlAuthGuard)
  meAdmin(@Context() ctx: any): AdminDto {
    const payload = ctx.req.user;
    if (!payload) {
      throw new UnauthorizedException('Neautorizovaný přístup');
    }
    return {
      id: payload.sub,
      username: payload.username,
    };
  }
}

