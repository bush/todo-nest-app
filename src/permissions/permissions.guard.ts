import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import util from 'node:util';

// https://auth0.com/blog/developing-a-secure-api-with-nestjs-adding-role-based-access-control/#Implement-Role-Based-Access-Control-in-NestJS

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const routePermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    const userPermissions = context.getArgs()[0].user.permissions;
    console.log(util.inspect(context.getArgs()[0].user))

    if (!routePermissions) {
      return true;
    }

    const hasPermission = () =>
      routePermissions.every(routePermission =>
        userPermissions.includes(routePermission),
      );

    return hasPermission();
  }
}
