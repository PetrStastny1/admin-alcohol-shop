import { Injectable, NotFoundException, OnModuleInit, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  // ✅ Seed při startu – vždy jen jeden admin
  async onModuleInit() {
    await this.adminRepository.clear();

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = this.adminRepository.create({
      username: 'admin',
      password: hashedPassword,
    });

    await this.adminRepository.save(admin);

    console.log('✅ Admin reset & seeded (username: admin, password: admin123)');
  }

  // ✅ Najde admina podle ID
  async findOneById(id: number): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) throw new NotFoundException(`Admin s ID ${id} nenalezen`);
    return admin;
  }

  // ✅ Najde admina podle username
  async findOneByUsername(username: string): Promise<Admin | null> {
    return this.adminRepository.findOne({ where: { username } });
  }

  // ✅ Vrátí všechny adminy
  async findAll(): Promise<Admin[]> {
    return this.adminRepository.find();
  }

  // ✅ Vytvoří nového admina (pokud už existuje, vyhodí chybu)
  async createAdmin(username: string, password: string): Promise<Admin> {
    const existing = await this.findOneByUsername(username);
    if (existing) {
      throw new BadRequestException(`Admin s username "${username}" už existuje`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = this.adminRepository.create({ username, password: hashedPassword });
    return this.adminRepository.save(admin);
  }

  // ✅ Aktualizace hesla
  async updatePassword(id: number, newPassword: string): Promise<Admin> {
    const admin = await this.findOneById(id);
    admin.password = await bcrypt.hash(newPassword, 10);
    return this.adminRepository.save(admin);
  }

  // ✅ Smazání admina
  async deleteAdmin(id: number): Promise<boolean> {
    const result = await this.adminRepository.delete(id);
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(`Admin s ID ${id} nenalezen`);
    }
    return true;
  }

  // ✅ Přihlášení admina
  async validateAdmin(username: string, password: string): Promise<Admin> {
    const admin = await this.findOneByUsername(username);
    if (!admin) throw new UnauthorizedException('Neplatné jméno nebo heslo');

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) throw new UnauthorizedException('Neplatné jméno nebo heslo');

    return admin;
  }
}
