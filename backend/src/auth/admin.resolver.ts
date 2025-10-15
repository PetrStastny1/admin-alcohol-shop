import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AdminService } from './admin.service';
import { AdminDto } from './dto/admin.dto';

@Resolver(() => AdminDto)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  // ✅ Vrátí všechny adminy
  @Query(() => [AdminDto])
  async admins(): Promise<AdminDto[]> {
    const admins = await this.adminService.findAll();
    return admins.map((a) => ({ id: a.id, username: a.username }));
  }

  // ✅ Vrátí admina podle ID
  @Query(() => AdminDto)
  async admin(@Args('id', { type: () => Int }) id: number): Promise<AdminDto> {
    const admin = await this.adminService.findOneById(id);
    return { id: admin.id, username: admin.username };
  }

  // ✅ Vytvoření admina
  @Mutation(() => AdminDto)
  async createAdmin(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<AdminDto> {
    const admin = await this.adminService.createAdmin(username, password);
    return { id: admin.id, username: admin.username };
  }

  // ✅ Aktualizace hesla admina
  @Mutation(() => AdminDto)
  async updateAdminPassword(
    @Args('id', { type: () => Int }) id: number,
    @Args('newPassword') newPassword: string,
  ): Promise<AdminDto> {
    const admin = await this.adminService.updatePassword(id, newPassword);
    return { id: admin.id, username: admin.username };
  }

  // ✅ Smazání admina
  @Mutation(() => Boolean)
  async deleteAdmin(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.adminService.deleteAdmin(id);
  }
}

