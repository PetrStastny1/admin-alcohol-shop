import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from './admin.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  // Přihlášení běžného uživatele
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException('Neplatný email nebo heslo');

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Neplatný email nebo heslo');

    const { password: _, ...result } = user;
    return result;
  }

  async loginUser(user: any): Promise<{ access_token: string }> {
    const payload = { username: user.email, sub: user.id, role: 'user' };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Přihlášení admina
  async validateAdmin(username: string, password: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { username } });
    if (!admin) throw new UnauthorizedException('Neplatné uživatelské jméno nebo heslo');

    const passwordValid = await bcrypt.compare(password, admin.password);
    if (!passwordValid) throw new UnauthorizedException('Neplatné uživatelské jméno nebo heslo');

    return admin;
  }

  async loginAdmin(username: string, password: string): Promise<{ access_token: string }> {
    const admin = await this.validateAdmin(username, password);
    const payload = { username: admin.username, sub: admin.id, role: 'admin' };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
