import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException('Neplatný email nebo heslo');

    const bcrypt = await import('bcrypt');
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Neplatný email nebo heslo');

    const { password: _, ...result } = user;
    return result;
  }

  async loginUser(user: any): Promise<{ access_token: string }> {
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '365d' }),
    };
  }

  private readonly hardcodedAdmin = {
    id: 1,
    username: 'admin',
    password: 'admin123',
  };

  async validateAdmin(
    username: string,
    password: string,
  ): Promise<{ id: number; username: string }> {
    if (
      username === this.hardcodedAdmin.username &&
      password === this.hardcodedAdmin.password
    ) {
      return { id: this.hardcodedAdmin.id, username: this.hardcodedAdmin.username };
    }
    throw new UnauthorizedException('Neplatné uživatelské jméno nebo heslo');
  }

  async loginAdmin(
    username: string,
    password: string,
  ): Promise<{ access_token: string; admin: { id: number; username: string } }> {
    const admin = await this.validateAdmin(username, password);
    const payload = { sub: admin.id, username: admin.username };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '365d' }),
      admin: admin,
    };
  }
}
