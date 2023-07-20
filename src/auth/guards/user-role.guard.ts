import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(
      'roles',
      context.getHandler(),
    );
    if (!validRoles) return true;
    if (validRoles.length == 0) return true;
    const req = context.switchToHttp().getRequest();
    if (!req.user) {
      throw new BadRequestException('User not found');
    }
    const user = req.user as User;
    for (const rol of user.roles) {
      if (validRoles.includes(rol)) {
        return true;
      }
    }
    throw new ForbiddenException(
      `User ${user.fullName} need a valid role: [${validRoles}]`,
    );
  }
}
