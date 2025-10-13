import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AdminService } from './admin.service';
import { Admin } from './admin.entity';

@Resolver(() => Admin)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  // --- Queries ---

  // Najde admina podle ID
  @Query(() => Admin, { nullable: true })
  async admin(@Args('id', { type: () => Int }) id: number): Promise<Admin | null> {
    return await this.adminService.findOneById(id);
  }

  // Vrátí všechny adminy
  @Query(() => [Admin])
  async admins(): Promise<Admin[]> {
    return await this.adminService.findAll();
  }

  // --- Mutations ---

  // Vytvoří nového admina
  @Mutation(() => Admin)
  async createAdmin(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<Admin> {
    return await this.adminService.createAdmin(username, password);
  }

  // Aktualizuje heslo existujícího admina
  @Mutation(() => Admin)
  async updateAdminPassword(
    @Args('id', { type: () => Int }) id: number,
    @Args('newPassword') newPassword: string,
  ): Promise<Admin> {
    return await this.adminService.updatePassword(id, newPassword);
  }

  // Smaže admina
  @Mutation(() => Boolean)
  async deleteAdmin(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return await this.adminService.deleteAdmin(id);
  }
}
