import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminResolver } from './admin.resolver';
import { Admin } from './admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admin])],
  providers: [AdminService, AdminResolver],
  exports: [AdminService],
})
export class AdminModule {}
