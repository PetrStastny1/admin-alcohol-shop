import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from './gql-auth.guard';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginAdminInput } from './dto/login-admin.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponseDto, { name: 'loginAdmin' })
  async loginAdmin(
    @Args('input') input: LoginAdminInput,
  ): Promise<LoginResponseDto> {
    const result = await this.authService.loginAdmin(input.username, input.password);
    if (!result) {
      throw new UnauthorizedException('Neplatné uživatelské jméno nebo heslo');
    }
    return {
      access_token: result.access_token,
      id: result.admin.id,
      username: result.admin.username,
    };
  }

  @Query(() => LoginResponseDto, { name: 'meAdmin' })
  @UseGuards(GqlAuthGuard)
  async meAdmin(@Context() ctx: any): Promise<LoginResponseDto> {
    const payload = ctx.req.user;
    if (!payload) {
      throw new UnauthorizedException('Neautorizovaný přístup');
    }
    return {
      access_token: '',
      id: payload.sub,
      username: payload.username,
    };
  }
}
