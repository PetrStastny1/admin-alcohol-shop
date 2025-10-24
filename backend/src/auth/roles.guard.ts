import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    console.log('DEBUG RolesGuard user:', user, 'requiredRoles:', requiredRoles);

    if (!requiredRoles) {
      return true;
    }

    if (!user) {
      console.log('❌ RolesGuard: žádný user v requestu');
      return false;
    }

    if (user.role === 'admin') {
      console.log('✅ RolesGuard: user je admin, povoleno');
      return true;
    }

    const allowed = requiredRoles.includes(user.role);
    console.log(
      allowed
        ? '✅ RolesGuard: role odpovídá, povoleno'
        : '❌ RolesGuard: role neodpovídá, zakázáno'
    );
    return allowed;
  }
}
