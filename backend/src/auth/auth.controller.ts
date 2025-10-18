import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Přihlášení admina
  @Post('login')
  async loginAdmin(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    if (!username || !password) {
      throw new UnauthorizedException('Username a password jsou povinné');
    }

    return this.authService.loginAdmin(username, password);
  }
}
