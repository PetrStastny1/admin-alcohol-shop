import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOneByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Neplatné uživatelské jméno nebo heslo');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Neplatné uživatelské jméno nebo heslo');
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async loginUser(
    username: string,
    password: string,
  ): Promise<{ access_token: string; user: any }> {
    const user = await this.validateUser(username, password);
    const payload = { sub: user.id, username: user.username, role: user.role };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '365d' }),
      user,
    };
  }
}
