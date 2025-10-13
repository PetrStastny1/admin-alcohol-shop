import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AdminService } from './admin.service';
import { AuthResolver } from './auth.resolver';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { UsersModule } from '../users/users.module';
import { Admin } from './admin.entity';
import { GqlAuthGuard } from './gql-auth.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([Admin]),
  ],
  providers: [
    AuthService,
    AdminService,
    AuthResolver,
    JwtStrategy,
    LocalStrategy,
    GqlAuthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
