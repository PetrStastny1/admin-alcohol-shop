import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  // Najde admina podle ID
  async findOneById(id: number): Promise<Admin | null> {
    return await this.adminRepository.findOne({ where: { id } });
  }

  // Najde admina podle username
  async findOneByUsername(username: string): Promise<Admin | null> {
    return await this.adminRepository.findOne({ where: { username } });
  }

  // Vrátí všechny adminy
  async findAll(): Promise<Admin[]> {
    return await this.adminRepository.find();
  }

  // Vytvoří nového admina
  async createAdmin(username: string, password: string): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = this.adminRepository.create({ username, password: hashedPassword });
    return await this.adminRepository.save(admin);
  }

  // Aktualizuje heslo existujícího admina
  async updatePassword(id: number, newPassword: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) throw new NotFoundException('Admin nenalezen');

    admin.password = await bcrypt.hash(newPassword, 10);
    return await this.adminRepository.save(admin);
  }

  // Smaže admina podle ID
  async deleteAdmin(id: number): Promise<boolean> {
    const result = await this.adminRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  // Ověří přihlášení admina podle username a hesla
  async validateAdmin(username: string, password: string): Promise<Admin | null> {
    const admin = await this.findOneByUsername(username);
    if (!admin) return null;

    const isValid = await bcrypt.compare(password, admin.password);
    return isValid ? admin : null;
  }
}

